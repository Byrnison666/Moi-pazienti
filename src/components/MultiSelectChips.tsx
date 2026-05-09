import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface Props {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  multi?: boolean;
}

export function MultiSelectChips({ options, selected, onChange, multi = true }: Props) {
  const t = useTheme();

  const toggle = (opt: string) => {
    const isSelected = selected.includes(opt);
    if (multi) {
      onChange(isSelected ? selected.filter(s => s !== opt) : [...selected, opt]);
    } else {
      onChange(isSelected ? [] : [opt]);
    }
  };

  return (
    <View style={styles.wrap}>
      {options.length === 0 ? (
        <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm }}>Нет вариантов</Text>
      ) : null}
      {options.map(opt => {
        const active = selected.includes(opt);
        return (
          <Pressable
            key={opt}
            onPress={() => toggle(opt)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? t.colors.primary : t.colors.chip,
                borderColor: active ? t.colors.primary : t.colors.border,
                borderRadius: t.radius.lg,
              },
            ]}
          >
            {active ? (
              <Ionicons name="checkmark" size={14} color={t.colors.textInverse} style={{ marginRight: 4 }} />
            ) : null}
            <Text style={{ color: active ? t.colors.textInverse : t.colors.text, fontSize: t.fontSize.sm, fontWeight: '500' }}>
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, paddingHorizontal: 14,
    borderWidth: 1,
  },
});
