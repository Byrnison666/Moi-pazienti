# CLAUDE.md — «Мои пациенты» (dental-patients)

Android-приложение для врача-стоматолога: учёт пациентов, приёмов, заметок. **React Native + Expo SDK 54 + TypeScript.**

- Git: `origin` = `Byrnison666/Moi-pazienti`, ветка **main**. Есть `old-origin` (старый репо) — не пушить туда.
- Версия: `package.json` / `app.json` = **1.3.0**. Клон на Linux: `~/it/dental-patients` (раньше жил на Windows).
- Идентичность git настроена локально в репо (`Byrnison666` / `isolvecoagula@gmail.com`), глобальной на машине нет.

## Запуск и проверка

```bash
npx expo start          # затем Expo Go на устройстве
npx tsc --noEmit        # ДОЛЖНО быть 0 ошибок — это gate перед коммитом
```

Зависимости уже установлены (npm, без `--legacy-peer-deps`).

## Хранение данных

- Данные приложения — AsyncStorage, ключ `dental:data:v1` (тип `AppData`, `schemaVersion=1`).
- Настройки — AsyncStorage, ключ `dental:settings:v1`.
- Секреты синхронизации — `expo-secure-store` (НЕ AsyncStorage): `dental_sync_login`, `dental_sync_password`, `dental_sync_enabled`.

## Облачная синхронизация (WebDAV → Яндекс.Диск)

Модуль `src/sync/syncManager.ts` (+ `src/screens/SyncSettingsScreen.tsx`, `src/components/SyncStatusOverlay.tsx`).

- Транспорт: `fetch`-WebDAV на `https://webdav.yandex.ru`, Basic Auth `base64(login:appPassword)` (Hermes `btoa` + fallback), `MKCOL` папки при первом `PUT`.
- **`REMOTE_DIR = '/dental-patients'`** (не `/MoiPacienty`) — реальная боевая база лежит там: `Яндекс.Диск/dental-patients/data.json`, формат ровно `AppData`, ~81 реальный пациент.
- Слияние: LWW по `AppData.updatedAt`. **Demo-aware:** `hasRealData()` по `demoIds` — если облако реальное, а локально только демо/пусто, принимаем облако минуя LWW (иначе демка затирает боевые данные). Непустой локальный не затирать пустым удалённым.
- Failure modes: нет сети → `offline`; 401 → `error`; 404 на GET → push локального; прочее → `error` + warn, без краша.
- Контракт `syncManager`: `SyncState`, `subscribeSync`, `bindAppState`, `schedulePush` (debounce ~2.5с), `setOnRemoteSnapshot`, `syncOnLaunch`.

## Подводные камни

- `assets/splash.png` — **намеренно** валидный PNG 1×1 (69 байт), чтобы заставка не тупила (мгновенный фон `#020617` через `resizeMode:"cover"` + `backgroundColor`). НЕ восстанавливать полноразмерный.
- В истории git лежит APK ~74 МБ обычным blob; LFS настроен только на новые `*.apk`.

## Конвенции

- UI: компоненты `Card`, тема через `useTheme` (стиль как в `SettingsScreen`).
- Изменения перед коммитом: `npx tsc --noEmit` = 0. Реальный тест sync требует Яндекс-логин + пароль приложения (WebDAV) — их даёт пользователь.
