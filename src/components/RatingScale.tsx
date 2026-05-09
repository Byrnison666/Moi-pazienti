import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Props {
  value: number | null;
  onChange: (v: number | null) => void;
  min?: number;
  max?: number;
}

export function RatingScale({ value, onChange, min = 1, max = 10 }: Props) {
  const t = useTheme();
  const items = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.map(n => {
          const active = value === n;
          return (
            <Pressable
              key={n}
              onPress={() => onChange(active ? null : n)}
              style={[
                styles.cell,
                {
                  backgroundColor: active ? t.colors.primary : t.colors.surface,
                  borderColor: active ? t.colors.primary : t.colors.border,
                  borderRadius: t.radius.md,
                },
              ]}
            >
              <Text style={{ color: active ? t.colors.textInverse : t.colors.text, fontWeight: '600' }}>{n}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {value != null ? (
        <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.xs, marginTop: 6 }}>
          Выбрано: {value} из {max}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, paddingVertical: 4 },
  cell: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});
