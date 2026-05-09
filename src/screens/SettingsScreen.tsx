import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemeControls } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ThemeMode } from '../types';

export function SettingsScreen() {
  const t = useTheme();
  const { mode, setMode } = useThemeControls();
  const { resetAll, clearDemo, reseedDemo, data } = useData();
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmClearDemo, setConfirmClearDemo] = useState(false);

  const hasDemo = data.demoIds.patients.length > 0 || data.demoIds.templates.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: t.spacing(4), paddingBottom: 80 }}>
        <Text style={{ color: t.colors.text, fontSize: t.fontSize.xxl, fontWeight: '700' }}>Настройки</Text>

        <Card style={{ marginTop: 16 }}>
          <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.xs, fontWeight: '600', marginBottom: 8 }}>
            ПРИЛОЖЕНИЕ
          </Text>
          <InfoRow label="Название" value="Мои пациенты" />
          <InfoRow label="Версия" value="1.0.0" />
        </Card>

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

        <Card style={{ marginTop: 16 }}>
          <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.xs, fontWeight: '600', marginBottom: 12 }}>
            ДЕМО-ДАННЫЕ
          </Text>
          <Text style={{ color: t.colors.text, fontSize: t.fontSize.sm, marginBottom: 12 }}>
            При первом запуске добавляются примеры пациентов и шаблон анкеты. Их можно удалить или восстановить.
          </Text>
          <View style={{ gap: 8 }}>
            <AppButton
              title={hasDemo ? 'Удалить демо-данные' : 'Демо уже удалены'}
              variant="secondary"
              icon="trash-outline"
              fullWidth
              disabled={!hasDemo}
              onPress={() => setConfirmClearDemo(true)}
            />
            <AppButton
              title="Восстановить демо"
              variant="ghost"
              icon="refresh-outline"
              fullWidth
              onPress={reseedDemo}
            />
          </View>
        </Card>

        <Card style={{ marginTop: 16 }}>
          <Text style={{ color: t.colors.danger, fontSize: t.fontSize.xs, fontWeight: '600', marginBottom: 12 }}>
            ОПАСНАЯ ЗОНА
          </Text>
          <Text style={{ color: t.colors.text, fontSize: t.fontSize.sm, marginBottom: 12 }}>
            Удалить ВСЕ локальные данные: пациентов, заметки, приемы, файлы и анкеты.
          </Text>
          <AppButton
            title="Очистить все данные"
            variant="danger"
            icon="alert-circle-outline"
            fullWidth
            onPress={() => setConfirmReset(true)}
          />
        </Card>
      </ScrollView>

      <ConfirmDialog
        visible={confirmReset}
        title="Очистить все локальные данные?"
        message="Это действие нельзя отменить. Все пациенты, приемы, заметки, файлы и шаблоны анкет будут удалены."
        confirmTitle="Удалить всё"
        onCancel={() => setConfirmReset(false)}
        onConfirm={async () => { setConfirmReset(false); await resetAll(); }}
      />
      <ConfirmDialog
        visible={confirmClearDemo}
        title="Удалить демо-данные?"
        message="Будут удалены только пациенты и шаблоны, добавленные как демо. Ваши собственные данные не пострадают."
        confirmTitle="Удалить"
        onCancel={() => setConfirmClearDemo(false)}
        onConfirm={() => { setConfirmClearDemo(false); clearDemo(); }}
      />
    </SafeAreaView>
  );
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
