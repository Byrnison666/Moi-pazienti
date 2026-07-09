import {
  AppData,
  Appointment,
  ID,
  ISODate,
  JournalEntry,
  Note,
  Patient,
  PatientFile,
  PatientQuestionnaire,
  QuestionnaireTemplate,
  Tombstone,
} from '../types';

// Слияние двух снапшотов по сущностям. Заменяет LWW по всему снапшоту:
// раньше устройство со свежей меткой затирало чужие правки целиком.
//
// Правила:
//  - сущности объединяются по id, при конфликте побеждает большая метка времени;
//  - удаление фиксируется надгробием (Tombstone), иначе удалённый на A пациент
//    воскресал бы с B;
//  - если сущность правили ПОСЛЕ удаления (updatedAt > deletedAt), она выживает:
//    для медицинских данных потерять правку хуже, чем воскресить запись.

export const TOMBSTONE_TTL_DAYS = 90;

const DAY_MS = 24 * 60 * 60 * 1000;

function maxISO(a: ISODate, b: ISODate): ISODate {
  return a > b ? a : b;
}

/** Надгробия обеих сторон: union по id, у дубля берём позднейшее удаление. */
function mergeTombstones(a: Tombstone[], b: Tombstone[], now: number): Tombstone[] {
  const byId = new Map<ID, Tombstone>();
  for (const t of [...a, ...b]) {
    const prev = byId.get(t.id);
    if (!prev || t.deletedAt > prev.deletedAt) byId.set(t.id, t);
  }
  // GC: к этому сроку оба устройства заведомо синхронизировались.
  const cutoff = now - TOMBSTONE_TTL_DAYS * DAY_MS;
  return [...byId.values()]
    .filter(t => {
      const at = Date.parse(t.deletedAt);
      return Number.isNaN(at) || at >= cutoff;
    })
    .sort((x, y) => (x.id < y.id ? -1 : x.id > y.id ? 1 : 0));
}

/**
 * Union двух коллекций по id.
 * stampOf — метка времени сущности; при конфликте побеждает большая.
 * combine — как слить две версии одной сущности (по умолчанию берём победителя).
 * Удалённые (надгробие новее метки) отбрасываются.
 */
function mergeCollection<T extends { id: ID }>(
  a: T[],
  b: T[],
  tombstones: Map<ID, ISODate>,
  stampOf: (item: T) => ISODate,
  combine?: (x: T, y: T) => T,
): T[] {
  const byId = new Map<ID, T>();
  for (const item of [...a, ...b]) {
    const prev = byId.get(item.id);
    if (!prev) {
      byId.set(item.id, item);
      continue;
    }
    byId.set(item.id, combine ? combine(prev, item) : (stampOf(item) > stampOf(prev) ? item : prev));
  }

  const out: T[] = [];
  for (const item of byId.values()) {
    const deletedAt = tombstones.get(item.id);
    // Правка после удаления воскрешает запись — сознательно.
    if (deletedAt !== undefined && stampOf(item) <= deletedAt) continue;
    out.push(item);
  }
  return out.sort((x, y) => (x.id < y.id ? -1 : x.id > y.id ? 1 : 0));
}

function mergePatient(x: Patient, y: Patient, tombstones: Map<ID, ISODate>): Patient {
  // Скалярные поля берём у более свежей версии, коллекции сливаем поэлементно.
  const base = y.updatedAt > x.updatedAt ? y : x;

  return {
    ...base,
    notes: mergeCollection<Note>(x.notes ?? [], y.notes ?? [], tombstones, n => n.updatedAt),
    appointments: mergeCollection<Appointment>(
      x.appointments ?? [], y.appointments ?? [], tombstones, a => a.updatedAt,
    ),
    questionnaires: mergeCollection<PatientQuestionnaire>(
      x.questionnaires ?? [], y.questionnaires ?? [], tombstones, q => q.updatedAt,
    ),
    // Файлы неизменяемы: метка — addedAt.
    files: mergeCollection<PatientFile>(x.files ?? [], y.files ?? [], tombstones, f => f.addedAt),
    updatedAt: maxISO(x.updatedAt, y.updatedAt),
  };
}

/**
 * Отсеять вложенные сущности, на которые есть надгробие. Нужно и для пациента,
 * пришедшего лишь с одной стороны: mergePatient для него не вызывается, а его
 * заметка могла быть удалена на другом устройстве вместе с надгробием.
 */
function pruneNested(p: Patient, tombstones: Map<ID, ISODate>): Patient {
  const alive = <T extends { id: ID }>(items: T[], stampOf: (i: T) => ISODate): T[] =>
    items.filter(i => {
      const deletedAt = tombstones.get(i.id);
      return deletedAt === undefined || stampOf(i) > deletedAt;
    });

  return {
    ...p,
    notes: alive(p.notes ?? [], n => n.updatedAt),
    appointments: alive(p.appointments ?? [], a => a.updatedAt),
    questionnaires: alive(p.questionnaires ?? [], q => q.updatedAt),
    files: alive(p.files ?? [], f => f.addedAt),
  };
}

function uniq(a: ID[], b: ID[]): ID[] {
  return [...new Set([...a, ...b])].sort();
}

export function mergeAppData(local: AppData, remote: AppData, now: number = Date.now()): AppData {
  const tombs = mergeTombstones(local.tombstones ?? [], remote.tombstones ?? [], now);
  const tombMap = new Map<ID, ISODate>(tombs.map(t => [t.id, t.deletedAt]));

  return {
    patients: mergeCollection<Patient>(
      local.patients ?? [], remote.patients ?? [], tombMap,
      p => p.updatedAt,
      (x, y) => mergePatient(x, y, tombMap),
    ).map(p => pruneNested(p, tombMap)),
    templates: mergeCollection<QuestionnaireTemplate>(
      local.templates ?? [], remote.templates ?? [], tombMap, t => t.updatedAt,
    ),
    journal: mergeCollection<JournalEntry>(
      local.journal ?? [], remote.journal ?? [], tombMap, e => e.updatedAt,
    ),
    demoIds: {
      patients: uniq(local.demoIds?.patients ?? [], remote.demoIds?.patients ?? []),
      templates: uniq(local.demoIds?.templates ?? [], remote.demoIds?.templates ?? []),
    },
    tombstones: tombs,
    updatedAt: maxISO(local.updatedAt ?? '', remote.updatedAt ?? ''),
    schemaVersion: Math.max(local.schemaVersion ?? 1, remote.schemaVersion ?? 1),
  };
}

/**
 * Каноническая сериализация: ключи объектов отсортированы, поэтому два
 * эквивалентных снапшота дают одинаковую строку. Нужна, чтобы после merge
 * понять, изменилось ли что-то относительно локального и удалённого — и не
 * гонять лишний PUT на 400 КБ.
 */
export function canonical(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).filter(k => obj[k] !== undefined).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + canonical(obj[k])).join(',') + '}';
}
