import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Card } from '../components/Card';
import { AppInput } from '../components/AppInput';
import { AppButton } from '../components/AppButton';
import { DatePickerField } from '../components/DatePickerField';
import { todayISODate } from '../utils/date';
import { PatientsStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<PatientsStackParamList, 'NoteEdit'>;

export function NoteEditScreen({ navigation, route }: Props) {
  const t = useTheme();
  const { data, addNote, updateNote } = useData();
  const patient = data.patients.find(p => p.id === route.params.patientId);
  const note = route.params.noteId ? patient?.notes.find(n => n.id === route.params.noteId) : null;

  const [text, setText] = useState(note?.text ?? '');
  const [date, setDate] = useState<string>(note?.date ?? todayISODate());
  const [error, setError] = useState<string | undefined>();

  if (!patient) return null;

  const onSave = () => {
    if (!text.trim()) {
      setError('Заметка не может быть пустой');
      return;
    }
    if (note) {
      updateNote(patient.id, note.id, { text: text.trim(), date });
    } else {
      addNote(patient.id, { text: text.trim(), date });
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: t.spacing(4) }}>
        <Card>
          <DatePickerField
            label="Дата заметки"
            value={date}
            onChange={d => setDate(d ?? todayISODate())}
            allowClear={false}
          />
          <AppInput
            label="Текст заметки"
            required
            value={text}
            onChangeText={txt => { setText(txt); setError(undefined); }}
            placeholder="Например: боится анестезии, аллергия на лидокаин"
            multiline
            error={error}
            autoFocus
          />
        </Card>
        <View style={{ marginTop: 16 }}>
          <AppButton title="Сохранить" onPress={onSave} fullWidth size="lg" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
