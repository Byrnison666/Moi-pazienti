import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { useTheme } from '../context/ThemeContext';
import { Patient } from '../types';
import { ageText, calcAge, compareDates, formatDate, formatRelativeDate, isFutureDate } from '../utils/date';

interface Props {
  patient: Patient;
  onPress: () => void;
}

export function PatientCard({ patient, onPress }: Props) {
  const t = useTheme();
  const age = patient.age ?? calcAge(patient.birthDate);

  const upcoming = patient.appointments
    .filter(a => isFutureDate(a.date))
    .sort((a, b) => compareDates(a.date, b.date))[0];

  const initials = patient.fullName
    .split(/\s+/).filter(Boolean).slice(0, 2)
    .map(s => s[0]?.toUpperCase()).join('');

  return (
    <Card onPress={onPress} style={{ marginBottom: 12 }}>
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: t.colors.primarySoft }]}>
          <Text style={{ color: t.colors.primary, fontSize: 18, fontFamily: t.font.extrabold }}>{initials || '?'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: t.colors.text, fontSize: t.fontSize.md, fontFamily: t.font.extrabold }} numberOfLines={1}>
            {patient.fullName}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
            {patient.birthDate ? (
              <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, fontFamily: t.font.medium }}>
                {formatDate(patient.birthDate)}
              </Text>
            ) : null}
            {age != null ? (
              <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, fontFamily: t.font.medium }}>
                {patient.birthDate ? ' • ' : ''}{ageText(age)}
              </Text>
            ) : null}
          </View>
          {upcoming ? (
            <View style={[styles.upcoming, { backgroundColor: t.colors.accentSoft, borderRadius: t.radius.sm }]}>
              <Ionicons name="calendar" size={13} color={t.colors.accentStrong} />
              <Text style={{ color: t.colors.accentStrong, fontSize: t.fontSize.xs, marginLeft: 4, fontFamily: t.font.bold }}>
                {formatRelativeDate(upcoming.date)}{upcoming.time ? ` • ${upcoming.time}` : ''}
              </Text>
            </View>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={t.colors.textMuted} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  upcoming: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    paddingVertical: 4, paddingHorizontal: 8, marginTop: 6,
  },
});
