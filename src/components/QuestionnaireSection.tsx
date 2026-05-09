import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface Props {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  defaultOpen?: boolean;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
}

export function QuestionnaireSection({
  title, subtitle, icon, defaultOpen = true, rightAction, children,
}: Props) {
  const t = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={[styles.wrap, { backgroundColor: t.colors.surface, borderColor: t.colors.border, borderRadius: t.radius.lg }]}>
      <Pressable onPress={() => setOpen(o => !o)} style={[styles.header, { padding: t.spacing(4) }]}>
        {icon ? (
          <View style={[styles.iconBox, { backgroundColor: t.colors.primarySoft, borderRadius: t.radius.sm }]}>
            <Ionicons name={icon} size={18} color={t.colors.primary} />
          </View>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={{ color: t.colors.text, fontSize: t.fontSize.md, fontWeight: '700' }}>{title}</Text>
          {subtitle ? (
            <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.xs, marginTop: 2 }}>{subtitle}</Text>
          ) : null}
        </View>
        {rightAction}
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={t.colors.textMuted}
          style={{ marginLeft: 8 }}
        />
      </Pressable>
      {open ? (
        <View style={{ paddingHorizontal: t.spacing(4), paddingBottom: t.spacing(4) }}>
          {children}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
});
