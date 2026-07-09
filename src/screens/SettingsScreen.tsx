import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import { useTheme, useThemeControls } from '../context/ThemeContext';
import { Card } from '../components/Card';
import { ScreenHeader } from '../components/ScreenHeader';
import { ThemeMode } from '../types';
import { SyncState, subscribeSync } from '../sync/syncManager';

// Берём из app.json, чтобы версия не разъезжалась с релизом.
const APP_VERSION = Constants.expoConfig?.version ?? '—';

export function SettingsScreen() {
  const t = useTheme();
  const nav = useNavigation<any>();
  const { mode, setMode } = useThemeControls();
  const [sync, setSync] = useState<SyncState>({ status: 'unconfigured' });
  useEffect(() => subscribeSync(setSync), []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }} edges={['top']}>
      <ScreenHeader title="Настройки" />
      <ScrollView contentContainerStyle={{ padding: t.spacing(4), paddingBottom: 80 }}>
        <Card style={{ marginTop: 4 }}>
          <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.xs, fontFamily: t.font.extrabold, marginBottom: 8, letterSpacing: 1 }}>
            ПРИЛОЖЕНИЕ
          </Text>
          <InfoRow label="Название" value="Мои пациенты" />
          <InfoRow label="Версия" value={APP_VERSION} />
        </Card>

        <Pressable onPress={() => nav.navigate('SyncSettings')}>
          <Card style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.syncIcon, { backgroundColor: t.colors.primarySoft, borderRadius: t.radius.md }]}>
              <Ionicons name="cloud-outline" size={21} color={t.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.xs, fontFamily: t.font.extrabold, letterSpacing: 1 }}>
                СИНХРОНИЗАЦИЯ
              </Text>
              <Text style={{ color: t.colors.text, fontSize: t.fontSize.md, fontFamily: t.font.extrabold, marginTop: 3 }}>
                Яндекс.Диск (WebDAV)
              </Text>
              <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, fontFamily: t.font.medium, marginTop: 2 }}>
                {syncSubtitle(sync)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={t.colors.textMuted} />
          </Card>
        </Pressable>

        <Card style={{ marginTop: 16 }}>
          <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.xs, fontFamily: t.font.extrabold, marginBottom: 12, letterSpacing: 1 }}>
            ОФОРМЛЕНИЕ
          </Text>
          <View style={[styles.themeRow, { backgroundColor: t.colors.surfaceAlt, borderRadius: t.radius.md }]}>
            <ThemeOption mode="light" current={mode} onPress={setMode} label="Светлая" icon="sunny-outline" />
            <ThemeOption mode="dark" current={mode} onPress={setMode} label="Тёмная" icon="moon-outline" />
            <ThemeOption mode="system" current={mode} onPress={setMode} label="Система" icon="phone-portrait-outline" />
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
      <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, fontFamily: t.font.medium }}>{label}</Text>
      <Text style={{ color: t.colors.text, fontSize: t.fontSize.sm, fontFamily: t.font.bold }}>{value}</Text>
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
          backgroundColor: active ? t.colors.surface : 'transparent',
          borderRadius: t.radius.sm,
          margin: 4,
        },
      ]}
    >
      <Ionicons name={icon} size={18} color={active ? t.colors.accentStrong : t.colors.text} />
      <Text style={{
        color: active ? t.colors.accentStrong : t.colors.text,
        fontFamily: t.font.bold, fontSize: t.fontSize.sm, marginTop: 4,
      }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  syncIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  themeRow: { flexDirection: 'row', padding: 1 },
  themeBtn: { flex: 1, alignItems: 'center', paddingVertical: 10 },
});
