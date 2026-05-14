import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, useThemeControls } from '../context/ThemeContext';
import { Card } from '../components/Card';
import { ThemeMode } from '../types';
import { SyncState, subscribeSync } from '../sync/syncManager';

export function SettingsScreen() {
  const t = useTheme();
  const nav = useNavigation<any>();
  const { mode, setMode } = useThemeControls();
  const [sync, setSync] = useState<SyncState>({ status: 'unconfigured' });
  useEffect(() => subscribeSync(setSync), []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: t.spacing(4), paddingBottom: 80 }}>
        <Text style={{ color: t.colors.text, fontSize: t.fontSize.xxl, fontWeight: '700' }}>Настройки</Text>

        <Card style={{ marginTop: 16 }}>
          <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.xs, fontWeight: '600', marginBottom: 8 }}>
            ПРИЛОЖЕНИЕ
          </Text>
          <InfoRow label="Название" value="Мои пациенты" />
          <InfoRow label="Версия" value="1.2.0" />
        </Card>

        <Pressable onPress={() => nav.navigate('SyncSettings')}>
          <Card style={{ marginTop: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.xs, fontWeight: '600', marginBottom: 4 }}>
                  СИНХРОНИЗАЦИЯ
                </Text>
                <Text style={{ color: t.colors.text, fontSize: t.fontSize.md, fontWeight: '600' }}>
                  Яндекс.Диск (WebDAV)
                </Text>
                <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, marginTop: 4 }}>
                  {syncSubtitle(sync)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={t.colors.textMuted} />
            </View>
          </Card>
        </Pressable>

        <Card style={{ marginTop: 16 }}>
          <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.xs, fontWeight: '600', marginBottom: 12 }}>
            ОФОРМЛЕНИЕ
          </Text>
          <View style={styles.themeRow}>
            <ThemeOption mode="system" current={mode} onPress={setMode} label="Системная" icon="phone-portrait-outline" />
            <ThemeOption mode="light" current={mode} onPress={setMode} label="Светлая" icon="sunny-outline" />
            <ThemeOption mode="dark" current={mode} onPress={setMode} label="Тёмная" icon="moon-outline" />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function syncSubtitle(s: SyncState): string {
  switch (s.status) {
    case 'unconfigured': return 'Не настроена — нажмите для подключения';
    case 'idle': return s.lastSyncedAt ? 'Включена, всё синхронизировано' : 'Включена';
    case 'syncing': return 'Синхронизация…';
    case 'offline': return 'Нет соединения';
    case 'error': return 'Ошибка синхронизации';
  }
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const t = useTheme();
  return (
    <View style={styles.infoRow}>
      <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm }}>{label}</Text>
      <Text style={{ color: t.colors.text, fontSize: t.fontSize.sm, fontWeight: '500' }}>{value}</Text>
    </View>
  );
}

function ThemeOption({
  mode, current, onPress, label, icon,
}: {
  mode: ThemeMode; current: ThemeMode; onPress: (m: ThemeMode) => void;
  label: string; icon: keyof typeof Ionicons.glyphMap;
}) {
  const t = useTheme();
  const active = current === mode;
  return (
    <Pressable
      onPress={() => onPress(mode)}
      style={[
        styles.themeBtn,
        {
          backgroundColor: active ? t.colors.primary : t.colors.surfaceAlt,
          borderRadius: t.radius.md,
        },
      ]}
    >
      <Ionicons name={icon} size={18} color={active ? t.colors.textInverse : t.colors.text} />
      <Text style={{
        color: active ? t.colors.textInverse : t.colors.text,
        fontWeight: '600', fontSize: t.fontSize.sm, marginTop: 4,
      }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  themeRow: { flexDirection: 'row', gap: 8 },
  themeBtn: { flex: 1, alignItems: 'center', paddingVertical: 14 },
});
