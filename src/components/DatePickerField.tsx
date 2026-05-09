import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { formatDate, parseISODate, toISODate } from '../utils/date';

interface Props {
  label?: string;
  value?: string | null;
  onChange: (iso: string | undefined) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  allowClear?: boolean;
}

export function DatePickerField({
  label, value, onChange, required, error,
  placeholder = 'Выберите дату', allowClear = true,
}: Props) {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  const current = parseISODate(value) ?? new Date();
  const display = value ? formatDate(value) : '';

  const handleChange = (_: any, d?: Date) => {
    if (Platform.OS !== 'ios') setOpen(false);
    if (d) onChange(toISODate(d));
  };

  return (
    <View style={{ marginBottom: t.spacing(3) }}>
      {label != null && (
        <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, marginBottom: 6 }}>
          {label}{required ? ' *' : ''}
        </Text>
      )}
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.field,
          {
            backgroundColor: t.colors.surface,
            borderColor: error ? t.colors.danger : t.colors.border,
            borderRadius: t.radius.md,
          },
        ]}
      >
        <Ionicons name="calendar-outline" size={18} color={t.colors.textMuted} />
        <Text
          style={{
            flex: 1,
            color: display ? t.colors.text : t.colors.textMuted,
            fontSize: t.fontSize.md,
            marginLeft: 8,
          }}
        >
          {display || placeholder}
        </Text>
        {allowClear && value ? (
          <Pressable onPress={() => onChange(undefined)} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={t.colors.textMuted} />
          </Pressable>
        ) : null}
      </Pressable>
      {error ? <Text style={{ color: t.colors.danger, fontSize: t.fontSize.xs, marginTop: 4 }}>{error}</Text> : null}

      {open && (
        <DateTimePicker
          mode="date"
          value={current}
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleChange}
          maximumDate={new Date(2100, 11, 31)}
          minimumDate={new Date(1900, 0, 1)}
        />
      )}
      {Platform.OS === 'ios' && open && (
        <Pressable onPress={() => setOpen(false)} style={{ marginTop: 6 }}>
          <Text style={{ color: t.colors.primary, fontSize: t.fontSize.sm, alignSelf: 'flex-end' }}>Готово</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
});
