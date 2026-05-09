import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { AppButton } from './AppButton';

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionTitle?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = 'documents-outline', title, subtitle, actionTitle, onAction }: Props) {
  const t = useTheme();
  return (
    <View style={[styles.wrap, { padding: t.spacing(8) }]}>
      <View style={[styles.iconBox, { backgroundColor: t.colors.primarySoft, borderRadius: t.radius.xl }]}>
        <Ionicons name={icon} size={36} color={t.colors.primary} />
      </View>
      <Text style={{ color: t.colors.text, fontSize: t.fontSize.lg, fontWeight: '600', marginTop: 12, textAlign: 'center' }}>{title}</Text>
      {subtitle ? (
        <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, marginTop: 6, textAlign: 'center', lineHeight: 20 }}>{subtitle}</Text>
      ) : null}
      {actionTitle && onAction ? (
        <View style={{ marginTop: 16 }}>
          <AppButton title={actionTitle} onPress={onAction} icon="add" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  iconBox: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center' },
});
