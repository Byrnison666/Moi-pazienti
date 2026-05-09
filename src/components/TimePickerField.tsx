import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { normalizeTime } from '../utils/date';

interface Props {
  label?: string;
  value?: string | null;
  onChange: (time: string | undefined) => void;
  allowClear?: boolean;
}

export function TimePickerField({ label, value, onChange, allowClear = true }: Props) {
  const t = useTheme();
  const [open, setOpen] = useState(false);

  const parts = (value ?? '').split(':');
  const initial = new Date();
  if (parts.length === 2) {
    initial.setHours(Number(parts[0]) || 0, Number(parts[1]) || 0, 0, 0);
  }

  const handleChange = (_: any, d?: Date) => {
    if (Platform.OS !== 'ios') setOpen(false);
    if (d) {
      const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      onChange(normalizeTime(time));
    }
  };

  return (
    <View style={{ marginBottom: t.spacing(3) }}>
      {label != null && (
        <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, marginBottom: 6 }}>{label}</Text>
      )}
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.field,
          { backgroundColor: t.colors.surface, borderColor: t.colors.border, borderRadius: t.radius.md },
        ]}
      >
        <Ionicons name="time-outline" size={18} color={t.colors.textMuted} />
        <Text style={{ flex: 1, color: value ? t.colors.text : t.colors.textMuted, fontSize: t.fontSize.md, marginLeft: 8 }}>
          {value ?? 'Выбрать время'}
        </Text>
        {allowClear && value ? (
          <Pressable onPress={() => onChange(undefined)} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={t.colors.textMuted} />
          </Pressable>
        ) : null}
      </Pressable>
      {open && (
        <DateTimePicker
          mode="time"
          value={initial}
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
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
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1,
  },
});
