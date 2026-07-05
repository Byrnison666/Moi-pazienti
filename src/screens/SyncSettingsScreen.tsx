import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/Card';
import {
  SyncState,
  disableSync,
  getSyncConfig,
  saveSyncConfig,
  subscribeSync,
  syncNow,
} from '../sync/syncManager';

export function SyncSettingsScreen() {
  const t = useTheme();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sync, setSync] = useState<SyncState>({ status: 'unconfigured' });

  useEffect(() => subscribeSync(setSync), []);
  useEffect(() => {
    getSyncConfig().then(cfg => {
      setLogin(cfg.login);
      setEnabled(cfg.enabled);
    });
  }, []);

  const onSave = async () => {
    if (!login.trim() || !password) {
      Alert.alert('Проверьте данные', 'Укажите логин и пароль приложения Яндекс.');
      return;
    }
    setBusy(true);
    try {
      await saveSyncConfig(login, password);
      setEnabled(true);
      setPassword('');
      Alert.alert('Готово', 'Синхронизация включена.');
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось сохранить настройки.');
    } finally {
      setBusy(false);
    }
  };

  const onSyncNow = async () => {
    setBusy(true);
    try {
      await syncNow();
    } finally {
      setBusy(false);
    }
  };

  const onDisable = () => {
    Alert.alert('Отключить синхронизацию?', 'Пароль будет удалён с устройства. Локальные данные останутся.', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Отключить',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await disableSync();
            setEnabled(false);
            setPassword('');
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  const inputStyle = {
    backgroundColor: t.colors.surfaceAlt,
    borderColor: t.colors.border,
    borderWidth: 1,
    borderRadius: t.radius.md,
    color: t.colors.text,
    paddingHorizontal: t.spacing(3),
    paddingVertical: t.spacing(3),
    fontSize: t.fontSize.md,
    marginTop: 6,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: t.spacing(4), paddingBottom: 80 }} keyboardShouldPersistTaps="handled">
        <Card>
          <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.xs, fontWeight: '600', marginBottom: 4 }}>
            СТАТУС
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {sync.status === 'syncing' && <ActivityIndicator size="small" color={t.colors.primary} />}
            <Text style={{ color: statusColor(sync.status, t.colors), fontSize: t.fontSize.md, fontWeight: '600' }}>
              {statusLabel(sync.status)}
            </Text>
          </View>
          {sync.lastSyncedAt && (
            <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, marginTop: 4 }}>
              Последняя синхронизация: {formatTime(sync.lastSyncedAt)}
            </Text>
          )}
        </Card>

        <Card style={{ marginTop: 16 }}>
          <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.xs, fontWeight: '600', marginBottom: 4 }}>
            ЯНДЕКС.ДИСК (WebDAV)
          </Text>
          <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, marginBottom: 8 }}>
            Данные хранятся в папке «MoiPacienty» на вашем Яндекс.Диске. Нужен пароль приложения (не пароль от аккаунта).
          </Text>

          <Text style={{ color: t.colors.text, fontSize: t.fontSize.sm, fontWeight: '600', marginTop: 8 }}>Логин</Text>
          <TextInput
            value={login}
            onChangeText={setLogin}
            placeholder="имя_пользователя"
            placeholderTextColor={t.colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            style={inputStyle}
          />

          <Text style={{ color: t.colors.text, fontSize: t.fontSize.sm, fontWeight: '600', marginTop: 12 }}>
            Пароль приложения
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={enabled ? '•••••••• (сохранён)' : 'пароль приложения'}
            placeholderTextColor={t.colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            style={inputStyle}
          />

          <PrimaryButton
            label={enabled ? 'Сохранить и обновить' : 'Включить синхронизацию'}
            onPress={onSave}
            disabled={busy}
          />
        </Card>

        {enabled && (
          <Card style={{ marginTop: 16 }}>
            <PrimaryButton label="Синхронизировать сейчас" onPress={onSyncNow} disabled={busy} variant="soft" />
            <View style={{ height: 10 }} />
            <PrimaryButton label="Отключить" onPress={onDisable} disabled={busy} variant="danger" />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'soft' | 'danger';
}) {
  const t = useTheme();
  const bg =
    variant === 'danger' ? t.colors.danger : variant === 'soft' ? t.colors.surfaceAlt : t.colors.primary;
  const fg = variant === 'soft' ? t.colors.text : t.colors.textInverse;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: bg,
          borderRadius: t.radius.md,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          marginTop: 16,
        },
        variant !== 'primary' && { marginTop: 0 },
      ]}
    >
      <Text style={{ color: fg, fontSize: t.fontSize.md, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

function statusLabel(s: SyncState['status']): string {
  switch (s) {
    case 'unconfigured': return 'Не настроена';
    case 'idle': return 'Включена';
    case 'syncing': return 'Синхронизация…';
    case 'offline': return 'Нет соединения';
    case 'error': return 'Ошибка';
  }
}

function statusColor(s: SyncState['status'], c: ReturnType<typeof useTheme>['colors']): string {
  switch (s) {
    case 'idle': return c.success;
    case 'offline': return c.warning;
    case 'error': return c.danger;
    default: return c.text;
  }
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  btn: { alignItems: 'center', paddingVertical: 14 },
});
