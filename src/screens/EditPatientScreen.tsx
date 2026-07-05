import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { useData } from '../context/DataContext';
import { AppInput } from '../components/AppInput';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { DatePickerField } from '../components/DatePickerField';
import { calcAge } from '../utils/date';
import { PatientsStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<PatientsStackParamList, 'EditPatient'>;

export function EditPatientScreen({ navigation, route }: Props) {
  const t = useTheme();
  const { data, updatePatient } = useData();
  const patient = data.patients.find(p => p.id === route.params.patientId);

  const [fullName, setFullName] = useState(patient?.fullName ?? '');
  const [birthDate, setBirthDate] = useState<string | undefined>(patient?.birthDate);
  const [ageStr, setAgeStr] = useState(patient?.age != null ? String(patient.age) : '');
  const [error, setError] = useState<string | undefined>();

  if (!patient) return null;

  const onBirthChange = (d: string | undefined) => {
    setBirthDate(d);
    const a = calcAge(d);
    if (a != null) setAgeStr(String(a));
  };

  const onAgeChange = (text: string) => {
    setAgeStr(text.replace(/[^\d]/g, ''));
  };

  const onSave = () => {
    const name = fullName.trim();
    if (!name) {
      setError('Укажите ФИО');
      return;
    }
    const age = ageStr === '' ? undefined : Number(ageStr);
    updatePatient(patient.id, {
      fullName: name,
      birthDate,
      age: birthDate ? calcAge(birthDate) : age,
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }} edges={['bottom']}>
      <ScreenHeader title="Редактирование" />
      <ScrollView contentContainerStyle={{ padding: t.spacing(4) }}>
        <Card>
          <AppInput
            label="ФИО"
            required
            value={fullName}
            onChangeText={text => { setFullName(text); setError(undefined); }}
            placeholder="Иванов Иван Иванович"
            error={error}
            autoFocus
          />
          <DatePickerField
            label="Дата рождения"
            value={birthDate}
            onChange={onBirthChange}
          />
          <AppInput
            label="Возраст"
            value={ageStr}
            onChangeText={onAgeChange}
            keyboardType="numeric"
            placeholder="Опционально"
            hint={birthDate ? 'Рассчитан автоматически из даты рождения' : undefined}
            editable={!birthDate}
          />
        </Card>
        <View style={{ marginTop: 16 }}>
          <AppButton title="Сохранить" onPress={onSave} fullWidth size="lg" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
