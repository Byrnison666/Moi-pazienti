import React, { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { AppointmentCard } from '../components/AppointmentCard';
import { EmptyState } from '../components/EmptyState';
import { AppButton } from '../components/AppButton';
import { ListScreenHeader } from '../components/ListScreenHeader';
import { compareDates, isFutureDate } from '../utils/date';
import { getFloatingActionBottom, getFabListBottomPadding } from '../navigation/tabBarMetrics';
import { Appointment } from '../types';

interface Row { appointment: Appointment; patientId: string; patientName: string }

export function ScheduleScreen() {
  const t = useTheme();
  const { data } = useData();
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const insets = useSafeAreaInsets();

  const all: Row[] = useMemo(() => {
    return data.patients.flatMap(p => p.appointments.map(a => ({
      appointment: a, patientId: p.id, patientName: p.fullName,
    })));
  }, [data.patients]);

  const upcoming = useMemo(
    () => all.filter(r => isFutureDate(r.appointment.date)).sort((a, b) => compareDates(a.appointment.date, b.appointment.date)),
    [all],
  );
  const past = useMemo(
    () => all.filter(r => !isFutureDate(r.appointment.date)).sort((a, b) => compareDates(b.appointment.date, a.appointment.date)),
    [all],
  );

  const list = tab === 'upcoming' ? upcoming : past;

  const grouped = useMemo(() => {
    const m = new Map<string, Row[]>();
    for (const r of list) {
      const key = r.appointment.date;
      const arr = m.get(key) ?? [];
      arr.push(r);
      m.set(key, arr);
    }
    return Array.from(m.entries()).map(([date, items]) => ({ title: date, data: items }));
  }, [list]);

  const goAdd = () => {
    if (data.patients.length === 0) return;
    navigation.navigate('PickPatientForAppointment');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }} edges={['top']}>
      <ListScreenHeader title="Расписание" subtitle="Все приемы пациентов" />

      <View style={[styles.tabs, { marginHorizontal: t.spacing(4), marginTop: t.spacing(4), backgroundColor: t.colors.surfaceAlt, borderRadius: t.radius.md }]}>
        <TabBtn label={`Предстоящие (${upcoming.length})`} active={tab === 'upcoming'} onPress={() => setTab('upcoming')} />
        <TabBtn label={`Прошедшие (${past.length})`} active={tab === 'past'} onPress={() => setTab('past')} />
      </View>

      {grouped.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title={tab === 'upcoming' ? 'Нет предстоящих приемов' : 'Прошедших приемов нет'}
          subtitle={tab === 'upcoming' ? 'Добавьте прием — он появится в расписании.' : undefined}
          actionTitle={tab === 'upcoming' && data.patients.length > 0 ? 'Добавить прием' : undefined}
          onAction={tab === 'upcoming' && data.patients.length > 0 ? goAdd : undefined}
        />
      ) : (
        <SectionList
          sections={grouped}
          keyExtractor={r => r.appointment.id}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: t.spacing(4), paddingTop: t.spacing(4) }}
          ListFooterComponent={<View style={{ height: getFabListBottomPadding(insets.bottom) }} />}
          renderSectionHeader={({ section }) => <DateHeader iso={section.title} />}
          renderItem={({ item }) => (
            <AppointmentCard
              appointment={item.appointment}
              patientName={item.patientName}
              onPress={() => navigation.navigate('PatientDetail', { patientId: item.patientId })}
              onEdit={() => navigation.navigate('AppointmentEdit', { patientId: item.patientId, appointmentId: item.appointment.id })}
            />
          )}
        />
      )}

      {tab === 'upcoming' && data.patients.length > 0 && grouped.length > 0 ? (
        <View style={{ position: 'absolute', bottom: getFloatingActionBottom(insets.bottom), right: t.spacing(4) }}>
          <AppButton title="Добавить" icon="add" onPress={goAdd} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function TabBtn({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tab,
        { backgroundColor: active ? t.colors.surface : 'transparent', borderRadius: t.radius.sm },
      ]}
    >
      <Text style={{ color: active ? t.colors.accentStrong : t.colors.textMuted, fontFamily: t.font.bold, fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

function DateHeader({ iso }: { iso: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
      <Ionicons name="ellipse" size={6} color={t.colors.accent} />
      <Text style={{ color: t.colors.text, fontSize: t.fontSize.md, fontFamily: t.font.extrabold, marginLeft: 8 }}>
        {(() => {
          const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
          if (!m) return iso;
          return `${m[3]}.${m[2]}.${m[1]}`;
        })()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
});
