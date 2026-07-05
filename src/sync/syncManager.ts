import { AppState, AppStateStatus } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { AppData } from '../types';

// Синхронизация снапшота AppData по WebDAV на Яндекс.Диск.
// Один JSON-файл, LWW по AppData.updatedAt. Креды — в expo-secure-store,
// НЕ в AsyncStorage. Сеть — через fetch, без сторонних зависимостей.

export type SyncStatus = 'unconfigured' | 'idle' | 'syncing' | 'offline' | 'error';

export interface SyncState {
  status: SyncStatus;
  lastSyncedAt?: string;
}

const WEBDAV_BASE = 'https://webdav.yandex.ru';
const REMOTE_DIR = '/dental-patients';
const REMOTE_FILE = `${REMOTE_DIR}/data.json`;
const TIMEOUT_MS = 15000;
const PUSH_DEBOUNCE_MS = 2500;

const K_LOGIN = 'dental_sync_login';
const K_PASSWORD = 'dental_sync_password';
const K_ENABLED = 'dental_sync_enabled';

// --- Состояние модуля ---

let state: SyncState = { status: 'unconfigured' };
const listeners = new Set<(s: SyncState) => void>();
let onRemoteSnapshot: ((remote: AppData) => void) | null = null;
let lastKnownLocal: AppData | null = null;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let running = false;
let appStateBound = false;

function setState(status: SyncStatus, lastSyncedAt?: string): void {
  state = { status, lastSyncedAt: lastSyncedAt ?? state.lastSyncedAt };
  listeners.forEach(l => l(state));
}

// --- Публичный API ---

export function subscribeSync(cb: (s: SyncState) => void): () => void {
  listeners.add(cb);
  cb(state);
  return () => {
    listeners.delete(cb);
  };
}

export function setOnRemoteSnapshot(cb: ((remote: AppData) => void) | null): void {
  onRemoteSnapshot = cb;
}

export function bindAppState(): void {
  if (appStateBound) return;
  appStateBound = true;
  AppState.addEventListener('change', (s: AppStateStatus) => {
    if (s === 'active' && lastKnownLocal) {
      void runExclusive(() => pull(lastKnownLocal!));
    }
  });
}

export function schedulePush(data: AppData): void {
  lastKnownLocal = data;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void (async () => {
      const auth = await authHeader();
      if (!auth) return; // не настроено — тихо
      await runExclusive(() => doPush(data, auth));
    })();
  }, PUSH_DEBOUNCE_MS);
}

export async function syncOnLaunch(local: AppData): Promise<void> {
  lastKnownLocal = local;
  await runExclusive(() => pull(local));
}

// --- API для экрана настроек ---

export async function getSyncConfig(): Promise<{ login: string; enabled: boolean }> {
  const login = (await SecureStore.getItemAsync(K_LOGIN)) ?? '';
  const enabled = (await SecureStore.getItemAsync(K_ENABLED)) === '1';
  return { login, enabled };
}

export async function saveSyncConfig(login: string, appPassword: string): Promise<void> {
  await SecureStore.setItemAsync(K_LOGIN, login.trim());
  await SecureStore.setItemAsync(K_PASSWORD, appPassword);
  await SecureStore.setItemAsync(K_ENABLED, '1');
  if (lastKnownLocal) {
    await runExclusive(() => pull(lastKnownLocal!));
  } else {
    setState('idle');
  }
}

export async function disableSync(): Promise<void> {
  await SecureStore.deleteItemAsync(K_LOGIN);
  await SecureStore.deleteItemAsync(K_PASSWORD);
  await SecureStore.deleteItemAsync(K_ENABLED);
  state = { status: 'unconfigured' };
  listeners.forEach(l => l(state));
}

// Проверка кред без сохранения: 'ok' — авторизация прошла (файл есть или ещё нет),
// 'auth' — неверный логин/пароль, 'network' — нет связи/ошибка сервера.
export async function testConnection(login: string, appPassword: string): Promise<'ok' | 'auth' | 'network'> {
  if (!login.trim() || !appPassword) return 'auth';
  const header = 'Basic ' + base64(`${login.trim()}:${appPassword}`);
  let res: Response;
  try {
    res = await webdav('GET', REMOTE_FILE, header);
  } catch {
    return 'network';
  }
  if (res.status === 401) return 'auth';
  if (res.ok || res.status === 404) return 'ok';
  return 'network';
}

export async function syncNow(): Promise<void> {
  const auth = await authHeader();
  if (!auth) {
    setState('unconfigured');
    return;
  }
  if (lastKnownLocal) {
    await runExclusive(() => pull(lastKnownLocal!));
  }
}

// --- Ядро синхронизации ---

async function runExclusive(fn: () => Promise<void>): Promise<void> {
  if (running) return;
  running = true;
  try {
    await fn();
  } finally {
    running = false;
  }
}

async function pull(local: AppData): Promise<void> {
  const auth = await authHeader();
  if (!auth) {
    setState('unconfigured');
    return;
  }
  setState('syncing');

  let res: Response;
  try {
    res = await webdav('GET', REMOTE_FILE, auth);
  } catch {
    setState('offline');
    return;
  }

  if (res.status === 401) {
    setState('error');
    return;
  }
  if (res.status === 404) {
    // удалённого снапшота ещё нет — заливаем локальный
    await doPush(local, auth);
    return;
  }
  if (!res.ok) {
    console.warn('sync GET failed', res.status);
    setState('error');
    return;
  }

  let remote: AppData;
  try {
    remote = JSON.parse(await res.text()) as AppData;
  } catch (e) {
    console.warn('sync: bad remote json', e);
    setState('error');
    return;
  }

  // Demo-aware защита слияния. "Реальные данные" = что-то помимо демо/пустого.
  // Иначе свежий updatedAt локальной демки затёр бы реальную облачную базу
  // (и наоборот) при первом запуске.
  const remoteReal = hasRealData(remote);
  const localReal = hasRealData(local);

  if (remoteReal && !localReal) {
    // Облако — реальная база, локально только демо/пусто: принимаем облако.
    onRemoteSnapshot?.(remote);
    setState('idle', new Date().toISOString());
    return;
  }
  if (localReal && !remoteReal) {
    // Локально реальные данные, облако демо/пусто: заливаем локальные.
    await doPush(local, auth);
    return;
  }

  // Обе стороны реальные (или обе демо/пустые) — обычный LWW по updatedAt.
  const remoteAt = remote.updatedAt ?? '';
  const localAt = local.updatedAt ?? '';
  if (remoteAt > localAt) {
    onRemoteSnapshot?.(remote);
    setState('idle', new Date().toISOString());
  } else if (localAt > remoteAt) {
    await doPush(local, auth);
  } else {
    setState('idle', new Date().toISOString());
  }
}

async function doPush(data: AppData, auth: string): Promise<void> {
  setState('syncing');
  try {
    // создаём папку (идемпотентно: 405/409 если уже есть — игнорируем)
    try {
      await webdav('MKCOL', REMOTE_DIR, auth);
    } catch {
      // сеть могла упасть — PUT ниже это поймает
    }
    const res = await webdav('PUT', REMOTE_FILE, auth, JSON.stringify(data));
    if (res.status === 401) {
      setState('error');
      return;
    }
    if (!res.ok && res.status !== 201 && res.status !== 204) {
      console.warn('sync PUT failed', res.status);
      setState('error');
      return;
    }
    setState('idle', new Date().toISOString());
  } catch {
    setState('offline');
  }
}

// --- WebDAV / утилиты ---

async function authHeader(): Promise<string | null> {
  const [login, password, enabled] = await Promise.all([
    SecureStore.getItemAsync(K_LOGIN),
    SecureStore.getItemAsync(K_PASSWORD),
    SecureStore.getItemAsync(K_ENABLED),
  ]);
  if (!login || !password || enabled !== '1') return null;
  return 'Basic ' + base64(`${login}:${password}`);
}

async function webdav(
  method: string,
  path: string,
  auth: string,
  body?: string,
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(WEBDAV_BASE + path, {
      method,
      headers: {
        Authorization: auth,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body,
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

// Есть ли в снапшоте пользовательский контент помимо демо-данных.
function hasRealData(d: AppData): boolean {
  const demoPatients = new Set(d.demoIds?.patients ?? []);
  const demoTemplates = new Set(d.demoIds?.templates ?? []);
  const realPatients = (d.patients ?? []).some(p => !demoPatients.has(p.id));
  const realTemplates = (d.templates ?? []).some(t => !demoTemplates.has(t.id));
  const realJournal = (d.journal ?? []).length > 0;
  return realPatients || realTemplates || realJournal;
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Hermes не гарантирует btoa; кодируем сами через UTF-8 байты.
function base64(input: string): string {
  const bytes = utf8Bytes(input);
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    out += B64[b0 >> 2];
    out += B64[((b0 & 3) << 4) | (b1 >> 4)];
    out += i + 1 < bytes.length ? B64[((b1 & 15) << 2) | (b2 >> 6)] : '=';
    out += i + 2 < bytes.length ? B64[b2 & 63] : '=';
  }
  return out;
}

function utf8Bytes(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c < 0x80) {
      bytes.push(c);
    } else if (c < 0x800) {
      bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    } else if (c >= 0xd800 && c <= 0xdbff) {
      const c2 = str.charCodeAt(++i);
      c = 0x10000 + ((c & 0x3ff) << 10) + (c2 & 0x3ff);
      bytes.push(
        0xf0 | (c >> 18),
        0x80 | ((c >> 12) & 0x3f),
        0x80 | ((c >> 6) & 0x3f),
        0x80 | (c & 0x3f),
      );
    } else {
      bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
  }
  return bytes;
}
