import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { useData } from '../context/DataContext';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { DatePickerField } from '../components/DatePickerField';
import { TimePickerField } from '../components/TimePickerField';
import { todayISODate } from '../utils/date';
import { PatientsStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<PatientsStackParamList, 'AppointmentEdit'>;

export function AppointmentEditScreen({ navigation, route }: Props) {
  const t = useTheme();
  const { data, addAppointment, updateAppointment } = useData();
  const patient = data.patients.find(p => p.id === route.params.patientId);
  const existing = route.params.appointmentId
    ? patient?.appointments.find(a => a.id === route.params.appointmentId)
    : null;

  const [date, setDate] = useState<string>(existing?.date ?? route.params.initialDate ?? todayISODate());
  const [time, setTime] = useState<string | undefined>(existing?.time);
  const [description, setDescription] = useState(existing?.description ?? '');
  const [error, setError] = useState<string | undefined>();

  if (!patient) return null;

  const onSave = () => {
    if (!date) {
      setError('Укажите дату');
      return;
    }
    if (existing) {
      updateAppointment(patient.id, existing.id, { date, time, description: description.trim() || undefined });
    } else {
      addAppointment(patient.id, { date, time, description: description.trim() || undefined });
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }} edges={['bottom']}>
      <ScreenHeader title="Прием" />
      <ScrollView contentContainerStyle={{ padding: t.spacing(4) }}>
        <Card>
          <DatePickerField
            label="Дата приема"
            value={date}
            onChange={d => { setDate(d ?? todayISODate()); setError(undefined); }}
            required
            allowClear={false}
            error={error}
          />
          <TimePickerField label="Время приема" value={time} onChange={setTime} />
          <AppInput
            label="Описание"
            value={description}
            onChangeText={setDescription}
            placeholder="Например: лечение кариеса 26 зуба"
            multiline
          />
        </Card>
        <View style={{ marginTop: 16 }}>
          <AppButton title="Сохранить" onPress={onSave} fullWidth size="lg" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
