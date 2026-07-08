import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function AppButton({
  title, onPress, variant = 'primary', size = 'md',
  icon, loading, disabled, style, fullWidth,
}: Props) {
  const t = useTheme();

  const bg =
    variant === 'primary' ? t.colors.primary :
    variant === 'secondary' ? t.colors.primarySoft :
    variant === 'danger' ? t.colors.dangerSoft :
    'transparent';

  const fg =
    variant === 'primary' ? t.colors.textInverse :
    variant === 'secondary' ? t.colors.primary :
    variant === 'danger' ? t.colors.danger :
    t.colors.primary;

  const padV = size === 'sm' ? 8 : size === 'lg' ? 16 : 12;
  const padH = size === 'sm' ? 12 : size === 'lg' ? 22 : 16;
  const fz = size === 'sm' ? t.fontSize.sm : size === 'lg' ? t.fontSize.lg : t.fontSize.md;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: bg,
          paddingVertical: padV,
          paddingHorizontal: padH,
          borderRadius: t.radius.md,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: t.colors.border,
        },
        style,
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : (
          <>
            {icon && <Ionicons name={icon} size={fz + 2} color={fg} style={{ marginRight: 6 }} />}
            <Text style={{ color: fg, fontSize: fz, fontFamily: t.font.bold }}>{title}</Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
