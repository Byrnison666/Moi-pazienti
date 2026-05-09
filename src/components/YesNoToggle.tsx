import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export type YesNoValue = 'yes' | 'no' | 'unspecified' | null;

interface Props {
  value: YesNoValue;
  onChange: (v: YesNoValue) => void;
}

const OPTIONS: { key: YesNoValue; label: string }[] = [
  { key: 'yes', label: 'Да' },
  { key: 'no', label: 'Нет' },
  { key: 'unspecified', label: 'Не указано' },
];

export function YesNoToggle({ value, onChange }: Props) {
  const t = useTheme();
  return (
    <View style={styles.row}>
      {OPTIONS.map(opt => {
        const active = value === opt.key;
        return (
          <Pressable
            key={opt.key ?? 'null'}
            onPress={() => onChange(opt.key)}
            style={[
              styles.btn,
              {
                backgroundColor: active ? t.colors.primary : t.colors.surface,
                borderColor: active ? t.colors.primary : t.colors.border,
                borderRadius: t.radius.md,
              },
            ]}
          >
            <Text
              style={{
                color: active ? t.colors.textInverse : t.colors.text,
                fontWeight: active ? '600' : '500',
                fontSize: t.fontSize.sm,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  btn: {
    flex: 1, paddingVertical: 10, alignItems: 'center', borderWidth: 1,
  },
});
