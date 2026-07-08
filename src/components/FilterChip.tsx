import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface Props {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}

export function FilterChip({ label, icon, active, onPress }: Props) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? t.colors.accent : t.colors.surfaceAlt,
          borderRadius: t.radius.sm,
        },
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={14}
          color={active ? t.colors.textInverse : t.colors.text}
          style={{ marginRight: 6 }}
        />
      ) : null}
      <Text style={{
        color: active ? t.colors.textInverse : t.colors.text,
        fontFamily: t.font.bold,
        fontSize: t.fontSize.xs,
      }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 9, paddingHorizontal: 14,
  },
});
