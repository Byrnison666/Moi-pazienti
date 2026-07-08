import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { useTheme } from '../context/ThemeContext';
import { Appointment } from '../types';
import { formatDateLong, formatRelativeDate, isFutureDate } from '../utils/date';

interface Props {
  appointment: Appointment;
  patientName?: string;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function AppointmentCard({ appointment, patientName, onPress, onEdit, onDelete }: Props) {
  const t = useTheme();
  const future = isFutureDate(appointment.date);
  const accent = future ? t.colors.accentStrong : t.colors.textMuted;
  const accentSoft = future ? t.colors.accentSoft : t.colors.surfaceAlt;

  return (
    <Card onPress={onPress} style={{ marginBottom: 10 }}>
      <View style={styles.row}>
        <View style={[styles.dateBox, { backgroundColor: accentSoft, borderRadius: t.radius.md }]}>
          <Ionicons name={future ? 'calendar' : 'time-outline'} size={20} color={accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: t.colors.text, fontSize: t.fontSize.md, fontFamily: t.font.extrabold }}>
            {formatRelativeDate(appointment.date)}
            {appointment.time ? ` • ${appointment.time}` : ''}
          </Text>
          <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.xs, fontFamily: t.font.medium, marginTop: 2 }}>
            {formatDateLong(appointment.date)}
          </Text>
          {patientName ? (
            <Text style={{ color: t.colors.text, fontSize: t.fontSize.sm, fontFamily: t.font.bold, marginTop: 6 }} numberOfLines={1}>
              {patientName}
            </Text>
          ) : null}
          {appointment.description ? (
            <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, fontFamily: t.font.medium, marginTop: 4 }} numberOfLines={2}>
              {appointment.description}
            </Text>
          ) : null}
        </View>
        {(onEdit || onDelete) ? (
          <View style={{ alignItems: 'flex-end', gap: 12 }}>
            {onEdit ? (
              <Ionicons name="create-outline" size={20} color={t.colors.primary} onPress={onEdit} />
            ) : null}
            {onDelete ? (
              <Ionicons name="trash-outline" size={20} color={t.colors.danger} onPress={onDelete} />
            ) : null}
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  dateBox: {
    width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
});
