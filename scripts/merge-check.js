const assert = require('node:assert');
const fs = require('node:fs');
// Запуск: npm run check:merge (компилирует src/sync/merge.ts во временную папку).
const { mergeAppData, canonical, TOMBSTONE_TTL_DAYS } = require(process.env.MERGE_JS || '../.merge-build/sync/merge.js');

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); console.log(`  \x1b[32mPASS\x1b[0m ${name}`); passed++; }
  catch (e) { console.log(`  \x1b[31mFAIL\x1b[0m ${name}\n       ${e.message}`); failed++; }
}

const T = (iso) => new Date(iso).toISOString();
const base = (over = {}) => ({
  patients: [], templates: [], journal: [],
  demoIds: { patients: [], templates: [] },
  tombstones: [], updatedAt: T('2026-01-01'), schemaVersion: 2,
  ...over,
});
const patient = (id, name, updatedAt, over = {}) => ({
  id, fullName: name, notes: [], appointments: [], files: [], questionnaires: [],
  createdAt: T('2026-01-01'), updatedAt: T(updatedAt), ...over,
});
const note = (id, text, updatedAt) => ({
  id, text, date: '2026-01-01', createdAt: T('2026-01-01'), updatedAt: T(updatedAt),
});
const ids = (d) => d.patients.map(p => p.id).sort();

console.log('\n--- Слияние по сущностям (пункт 5) ---');

test('разные пациенты на двух устройствах — оба выживают', () => {
  const local = base({ patients: [patient('a', 'Аня', '2026-07-01')] });
  const remote = base({ patients: [patient('b', 'Боря', '2026-07-02')] });
  assert.deepStrictEqual(ids(mergeAppData(local, remote)), ['a', 'b']);
});

test('это ровно тот баг, что терял правки: старый LWW оставил бы одного', () => {
  // local свежее по updatedAt снапшота, но у remote есть свой пациент
  const local = base({ patients: [patient('a', 'Аня', '2026-07-09')], updatedAt: T('2026-07-09') });
  const remote = base({ patients: [patient('b', 'Боря', '2026-07-08')], updatedAt: T('2026-07-08') });
  const m = mergeAppData(local, remote);
  assert.strictEqual(m.patients.length, 2, 'оба пациента должны выжить');
});

test('один пациент правился на обоих — побеждает свежая версия', () => {
  const local = base({ patients: [patient('a', 'Старое имя', '2026-07-01')] });
  const remote = base({ patients: [patient('a', 'Новое имя', '2026-07-05')] });
  assert.strictEqual(mergeAppData(local, remote).patients[0].fullName, 'Новое имя');
});

test('заметки одного пациента сливаются с обеих сторон', () => {
  const local = base({ patients: [patient('a', 'Аня', '2026-07-01', { notes: [note('n1', 'первая', '2026-07-01')] })] });
  const remote = base({ patients: [patient('a', 'Аня', '2026-07-02', { notes: [note('n2', 'вторая', '2026-07-02')] })] });
  const notes = mergeAppData(local, remote).patients[0].notes.map(n => n.id).sort();
  assert.deepStrictEqual(notes, ['n1', 'n2']);
});

console.log('\n--- Надгробия ---');

test('удалённый пациент не воскресает со второго устройства', () => {
  const local = base({ tombstones: [{ id: 'a', deletedAt: T('2026-07-05') }] });
  const remote = base({ patients: [patient('a', 'Аня', '2026-07-01')] });
  assert.deepStrictEqual(ids(mergeAppData(local, remote)), []);
});

test('удалённая заметка не воскресает', () => {
  const local = base({
    patients: [patient('a', 'Аня', '2026-07-05')],
    tombstones: [{ id: 'n1', deletedAt: T('2026-07-05') }],
  });
  const remote = base({ patients: [patient('a', 'Аня', '2026-07-01', { notes: [note('n1', 'старая', '2026-07-01')] })] });
  assert.deepStrictEqual(mergeAppData(local, remote).patients[0].notes, []);
});

test('заметка не воскресает и когда пациент есть только у одной стороны', () => {
  // pruneNested: mergePatient для такого пациента не вызывается
  const local = base({ tombstones: [{ id: 'n1', deletedAt: T('2026-07-05') }] });
  const remote = base({ patients: [patient('a', 'Аня', '2026-07-01', { notes: [note('n1', 'старая', '2026-07-01')] })] });
  assert.deepStrictEqual(mergeAppData(local, remote).patients[0].notes, []);
});

test('правка ПОСЛЕ удаления воскрешает запись (сознательно)', () => {
  const local = base({ tombstones: [{ id: 'a', deletedAt: T('2026-07-05') }] });
  const remote = base({ patients: [patient('a', 'Аня', '2026-07-09')] });
  assert.deepStrictEqual(ids(mergeAppData(local, remote)), ['a'], 'правка новее удаления — запись жива');
});

test('надгробия старше 90 дней вычищаются', () => {
  const now = Date.parse('2026-07-09');
  const old = new Date(now - (TOMBSTONE_TTL_DAYS + 5) * 86400000).toISOString();
  const fresh = new Date(now - 10 * 86400000).toISOString();
  const local = base({ tombstones: [{ id: 'old', deletedAt: old }, { id: 'new', deletedAt: fresh }] });
  const m = mergeAppData(local, base(), now);
  assert.deepStrictEqual(m.tombstones.map(t => t.id), ['new']);
});

test('у дубля надгробия берётся позднейшее удаление', () => {
  const local = base({ tombstones: [{ id: 'a', deletedAt: T('2026-07-01') }] });
  const remote = base({ tombstones: [{ id: 'a', deletedAt: T('2026-07-05') }] });
  assert.strictEqual(mergeAppData(local, remote).tombstones[0].deletedAt, T('2026-07-05'));
});

console.log('\n--- canonical (нужен, чтобы не гнать лишний PUT) ---');

test('порядок ключей не влияет на результат', () => {
  assert.strictEqual(canonical({ b: 1, a: 2 }), canonical({ a: 2, b: 1 }));
});

test('разное содержимое даёт разные строки', () => {
  assert.notStrictEqual(canonical({ a: 1 }), canonical({ a: 2 }));
});

test('merge идемпотентен: повторное слияние ничего не меняет', () => {
  const local = base({ patients: [patient('a', 'Аня', '2026-07-01')] });
  const remote = base({ patients: [patient('b', 'Боря', '2026-07-02')] });
  const once = mergeAppData(local, remote);
  const twice = mergeAppData(once, once);
  assert.strictEqual(canonical(once), canonical(twice));
});

test('merge симметричен: порядок аргументов не меняет набор пациентов', () => {
  const local = base({ patients: [patient('a', 'Аня', '2026-07-01')] });
  const remote = base({ patients: [patient('b', 'Боря', '2026-07-02')] });
  assert.deepStrictEqual(ids(mergeAppData(local, remote)), ids(mergeAppData(remote, local)));
});

console.log('\n--- Боевые данные: 81 против 91 ---');

// Боевой снапшот для проверки на реальных данных. Нет — эти тесты пропускаются.
const REAL = process.env.REAL_SNAPSHOT
  || require('node:path').join(require('node:os').homedir(), 'backups/dental-patients/data-cloud-2026-07-09-91patients.json');
if (fs.existsSync(REAL)) {
  const cloud = JSON.parse(fs.readFileSync(REAL, 'utf8'));
  cloud.tombstones = cloud.tombstones ?? [];

  test('облако 91 + отставший телефон 81 = 91 (ничего не теряется)', () => {
    const sorted = [...cloud.patients].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const stale = { ...cloud, patients: sorted.slice(0, 81), updatedAt: T('2026-07-06') };
    const m = mergeAppData(stale, cloud);
    assert.strictEqual(m.patients.length, 91);
  });

  test('и в обратную сторону — тоже 91', () => {
    const sorted = [...cloud.patients].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const stale = { ...cloud, patients: sorted.slice(0, 81), updatedAt: T('2026-07-06') };
    assert.strictEqual(mergeAppData(cloud, stale).patients.length, 91);
  });

  test('телефон B добавил своего пациента офлайн — он доезжает, 91 на месте', () => {
    const sorted = [...cloud.patients].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const stale = {
      ...cloud,
      patients: [...sorted.slice(0, 81), patient('new-on-b', 'Новый С Телефона Б', '2026-07-09')],
      updatedAt: T('2026-07-09'),
    };
    const m = mergeAppData(stale, cloud);
    assert.strictEqual(m.patients.length, 92);
    assert.ok(m.patients.some(p => p.id === 'new-on-b'), 'пациент с B должен доехать');
  });

  test('первое слияние переставляет пациентов по id — будет ровно один лишний PUT', () => {
    const m = mergeAppData(cloud, cloud);
    const sameSet = JSON.stringify(m.patients.map(p => p.id).sort())
      === JSON.stringify(cloud.patients.map(p => p.id).sort());
    assert.ok(sameSet, 'набор пациентов не меняется');
    assert.notStrictEqual(canonical(m), canonical(cloud), 'порядок отличается — отсюда один PUT');
  });

  test('после этого слияние стабильно: второй PUT не нужен', () => {
    const once = mergeAppData(cloud, cloud);
    const twice = mergeAppData(once, once);
    assert.strictEqual(canonical(once), canonical(twice), 'повторный merge не даёт расхождений');
  });

  test('ни один пациент не потерял заметки/приёмы при слиянии', () => {
    const m = mergeAppData(cloud, cloud);
    const before = cloud.patients.reduce((s, p) => s + p.notes.length + p.appointments.length + p.questionnaires.length, 0);
    const after = m.patients.reduce((s, p) => s + p.notes.length + p.appointments.length + p.questionnaires.length, 0);
    assert.strictEqual(after, before, `было ${before}, стало ${after}`);
  });
} else {
  console.log('  \x1b[33mSKIP\x1b[0m боевые данные не найдены:', REAL);
}

console.log(`\nИтого: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
