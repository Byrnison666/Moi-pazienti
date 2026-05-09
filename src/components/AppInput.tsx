import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Props extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  containerStyle?: ViewStyle;
  multiline?: boolean;
}

export function AppInput({
  label, error, hint, required, containerStyle, multiline, ...rest
}: Props) {
  const t = useTheme();
  return (
    <View style={[{ marginBottom: t.spacing(3) }, containerStyle]}>
      {label != null && (
        <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, marginBottom: 6 }}>
          {label}{required ? ' *' : ''}
        </Text>
      )}
      <TextInput
        placeholderTextColor={t.colors.textMuted}
        {...rest}
        multiline={multiline}
        style={[
          styles.input,
          {
            backgroundColor: t.colors.surface,
            borderColor: error ? t.colors.danger : t.colors.border,
            color: t.colors.text,
            fontSize: t.fontSize.md,
            borderRadius: t.radius.md,
            paddingVertical: multiline ? 10 : 12,
            minHeight: multiline ? 90 : undefined,
            textAlignVertical: multiline ? 'top' : 'center',
          },
        ]}
      />
      {error ? (
        <Text style={{ color: t.colors.danger, fontSize: t.fontSize.xs, marginTop: 4 }}>{error}</Text>
      ) : hint ? (
        <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.xs, marginTop: 4 }}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
  },
});
