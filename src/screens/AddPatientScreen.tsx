import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { Card } from '../components/Card';
import { DatePickerField } from '../components/DatePickerField';
import { QuestionnaireSection } from '../components/QuestionnaireSection';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { QuestionnaireAnswerField } from '../components/QuestionnaireAnswerField';
import { newId } from '../utils/id';
import { calcAge, nowISO, todayISODate } from '../utils/date';
import {
  Appointment, Note, PatientFile, PatientQuestionnaire,
  QuestionnaireAnswer, QuestionnaireTemplate,
} from '../types';

interface DraftAppointment {
  tempId: string;
  date: string;
  description?: string;
}
interface DraftNote {
  tempId: string;
  text: string;
  date: string;
}

export function AddPatientScreen() {
  const t = useTheme();
  const { addPatient, data } = useData();
  const navigation = useNavigation<any>();

  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState<string | undefined>();
  const [ageStr, setAgeStr] = useState('');
  const [error, setError] = useState<string | undefined>();

  const [notes, setNotes] = useState<DraftNote[]>([]);
  const [appointments, setAppointments] = useState<DraftAppointment[]>([]);
  const [files, setFiles] = useState<Omit<PatientFile, 'id' | 'addedAt'>[]>([]);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<QuestionnaireAnswer[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);

  const selectedTemplate = data.templates.find(tpl => tpl.id === selectedTemplateId) ?? null;

  const onBirthChange = (d?: string) => {
    setBirthDate(d);
    const a = calcAge(d);
    if (a != null) setAgeStr(String(a));
  };

  const updateAnswer = (questionId: string, value: any) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      if (existing) return prev.map(a => a.questionId === questionId ? { ...a, value } : a);
      return [...prev, { questionId, value }];
    });
  };

  const onAddNote = () => {
    setNotes(prev => [...prev, { tempId: newId(), text: '', date: todayISODate() }]);
  };

  const onAddAppointment = () => {
    setAppointments(prev => [...prev, { tempId: newId(), date: todayISODate() }]);
  };

  const onPickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false });
      if (res.canceled) return;
      const asset = res.assets[0];
      setFiles(prev => [...prev, {
        name: asset.name, uri: asset.uri,
        mimeType: asset.mimeType ?? undefined, size: asset.size ?? undefined,
      }]);
    } catch {
      Alert.alert('Ошибка', 'Не удалось добавить файл');
    }
  };

  const reset = () => {
    setFullName('');
    setBirthDate(undefined);
    setAgeStr('');
    setNotes([]);
    setAppointments([]);
    setFiles([]);
    setSelectedTemplateId(null);
    setAnswers([]);
    setError(undefined);
  };

  const onSave = () => {
    const name = fullName.trim();
    if (!name) {
      setError('Укажите ФИО');
      return;
    }

    const age = ageStr === '' ? undefined : Number(ageStr);
    const ts = nowISO();

    const builtNotes: Note[] = notes
      .filter(n => n.text.trim())
      .map(n => ({
        id: newId(), text: n.text.trim(), date: n.date, createdAt: ts, updatedAt: ts,
      }));

    const builtAppointments: Appointment[] = appointments
      .filter(a => a.date)
      .map(a => ({
        id: newId(),
        patientId: '',
        date: a.date,
        description: a.description?.trim() || undefined,
        createdAt: ts,
        updatedAt: ts,
      }));

    const builtFiles: PatientFile[] = files.map(f => ({
      id: newId(), addedAt: ts, ...f,
    }));

    const builtQuestionnaires: PatientQuestionnaire[] = [];
    if (selectedTemplate) {
      const hasAnyAnswer = answers.some(a => a.value != null && a.value !== '' && !(Array.isArray(a.value) && a.value.length === 0));
      if (hasAnyAnswer) {
        builtQuestionnaires.push({
          id: newId(),
          patientId: '',
          templateId: selectedTemplate.id,
          templateTitle: selectedTemplate.title,
          questionsSnapshot: selectedTemplate.questions,
          answers,
          completedAt: todayISODate(),
          updatedAt: ts,
        });
      }
    }

    const created = addPatient({
      fullName: name,
      birthDate,
      age: birthDate ? calcAge(birthDate) : age,
      notes: builtNotes,
      appointments: builtAppointments,
      files: builtFiles,
      questionnaires: builtQuestionnaires,
    });

    reset();

    navigation.dispatch(
      CommonActions.navigate({
        name: 'PatientsTab',
        params: {
          screen: 'PatientDetail',
          params: { patientId: created.id },
          initial: false,
        },
      }),
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: t.spacing(4), paddingBottom: 80 }}>
        <View style={{ marginBottom: t.spacing(4) }}>
          <Text style={{ color: t.colors.text, fontSize: t.fontSize.xxl, fontWeight: '700' }}>Новый пациент</Text>
          <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, marginTop: 2 }}>
            Заполните только нужные блоки. Обязательно — только ФИО.
          </Text>
        </View>

        <QuestionnaireSection icon="person-outline" title="Данные пациента" subtitle="Обязательно — ФИО">
          <AppInput
            label="ФИО"
            required
            value={fullName}
            onChangeText={text => { setFullName(text); setError(undefined); }}
            placeholder="Иванов Иван Иванович"
            error={error}
          />
          <DatePickerField label="Дата рождения" value={birthDate} onChange={onBirthChange} />
          <AppInput
            label="Возраст"
            value={ageStr}
            onChangeText={text => setAgeStr(text.replace(/[^\d]/g, ''))}
            keyboardType="numeric"
            placeholder="Опционально"
            hint={birthDate ? 'Рассчитан из даты рождения' : 'Можно ввести вручную'}
            editable={!birthDate}
          />
        </QuestionnaireSection>

        <QuestionnaireSection
          icon="document-text-outline"
          title="Заметки"
          subtitle={notes.length ? `${notes.length} шт.` : 'Опционально'}
          defaultOpen={false}
          rightAction={<AddBtn onPress={onAddNote} />}
        >
          {notes.length === 0 ? (
            <Hint text="Особенности пациента, важные напоминания. Нажмите «+», чтобы добавить." />
          ) : (
            notes.map((n, i) => (
              <DraftNoteEditor
                key={n.tempId}
                index={i}
                draft={n}
                onChange={(next) => setNotes(prev => prev.map(x => x.tempId === n.tempId ? next : x))}
                onRemove={() => setNotes(prev => prev.filter(x => x.tempId !== n.tempId))}
              />
            ))
          )}
        </QuestionnaireSection>

        <QuestionnaireSection
          icon="calendar-outline"
          title="Приемы"
          subtitle={appointments.length ? `${appointments.length} шт.` : 'Опционально'}
          defaultOpen={false}
          rightAction={<AddBtn onPress={onAddAppointment} />}
        >
          {appointments.length === 0 ? (
            <Hint text="Запланируйте предстоящий прием." />
          ) : (
            appointments.map((a, i) => (
              <DraftAppointmentEditor
                key={a.tempId}
                index={i}
                draft={a}
                onChange={(next) => setAppointments(prev => prev.map(x => x.tempId === a.tempId ? next : x))}
                onRemove={() => setAppointments(prev => prev.filter(x => x.tempId !== a.tempId))}
              />
            ))
          )}
        </QuestionnaireSection>

        <QuestionnaireSection
          icon="attach-outline"
          title="Файлы"
          subtitle={files.length ? `${files.length} шт.` : 'Опционально'}
          defaultOpen={false}
          rightAction={<AddBtn onPress={onPickFile} icon="attach" />}
        >
          {files.length === 0 ? (
            <Hint text="Прикрепите снимки, заключения или PDF." />
          ) : (
            files.map((f, i) => (
              <View key={i} style={[styles.fileRow, { borderColor: t.colors.border, borderRadius: t.radius.sm }]}>
                <Ionicons name="document-outline" size={18} color={t.colors.primary} />
                <Text style={{ flex: 1, color: t.colors.text, fontSize: t.fontSize.sm, marginLeft: 8 }} numberOfLines={1}>{f.name}</Text>
                <Ionicons name="close-circle" size={18} color={t.colors.danger}
                  onPress={() => setFiles(prev => prev.filter((_, j) => j !== i))} />
              </View>
            ))
          )}
        </QuestionnaireSection>

        <QuestionnaireSection
          icon="clipboard-outline"
          title="Анкета"
          subtitle={selectedTemplate ? selectedTemplate.title : 'Опционально'}
          defaultOpen={false}
        >
          <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, marginBottom: 8 }}>
            Выбрать шаблон:
          </Text>
          {data.templates.length === 0 ? (
            <Hint text="Шаблонов анкет ещё нет. Создайте во вкладке «Анкеты»." />
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {data.templates.map(tpl => {
                const active = selectedTemplateId === tpl.id;
                return (
                  <View key={tpl.id}>
                    <AppButton
                      title={tpl.title}
                      size="sm"
                      variant={active ? 'primary' : 'secondary'}
                      onPress={() => {
                        if (active) { setSelectedTemplateId(null); setAnswers([]); }
                        else { setSelectedTemplateId(tpl.id); setAnswers([]); }
                      }}
                    />
                  </View>
                );
              })}
            </View>
          )}

          {selectedTemplate ? (
            <View>
              {selectedTemplate.questions.map(q => (
                <QuestionnaireAnswerField
                  key={q.id}
                  question={q}
                  answer={answers.find(a => a.questionId === q.id)}
                  onChange={(v) => updateAnswer(q.id, v)}
                />
              ))}
            </View>
          ) : null}
        </QuestionnaireSection>

        <View style={{ marginTop: 12, flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <AppButton title="Очистить" variant="ghost" fullWidth onPress={() => setConfirmReset(true)} />
          </View>
          <View style={{ flex: 2 }}>
            <AppButton title="Сохранить пациента" onPress={onSave} fullWidth size="lg" />
          </View>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={confirmReset}
        title="Очистить форму?"
        message="Все введенные данные будут удалены."
        confirmTitle="Очистить"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => { setConfirmReset(false); reset(); }}
      />
    </SafeAreaView>
  );
}

function AddBtn({ onPress, icon = 'add' }: { onPress: () => void; icon?: keyof typeof Ionicons.glyphMap }) {
  const t = useTheme();
  return (
    <View>
      <AppButton title="" icon={icon} size="sm" variant="secondary" onPress={onPress} style={{ paddingHorizontal: 10 }} />
    </View>
  );
}

function Hint({ text }: { text: string }) {
  const t = useTheme();
  return (
    <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, paddingVertical: 6 }}>{text}</Text>
  );
}

function DraftNoteEditor({
  draft, index, onChange, onRemove,
}: {
  draft: DraftNote; index: number;
  onChange: (n: DraftNote) => void; onRemove: () => void;
}) {
  const t = useTheme();
  return (
    <View style={[styles.draftBox, { backgroundColor: t.colors.surfaceAlt, borderColor: t.colors.border, borderRadius: t.radius.md }]}>
      <View style={styles.draftHeader}>
        <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.xs, fontWeight: '600' }}>ЗАМЕТКА {index + 1}</Text>
        <Ionicons name="close-circle" size={18} color={t.colors.danger} onPress={onRemove} />
      </View>
      <DatePickerField label="Дата" value={draft.date} onChange={d => onChange({ ...draft, date: d ?? draft.date })} allowClear={false} />
      <AppInput label="Текст" value={draft.text} multiline onChangeText={text => onChange({ ...draft, text })} />
    </View>
  );
}

function DraftAppointmentEditor({
  draft, index, onChange, onRemove,
}: {
  draft: DraftAppointment; index: number;
  onChange: (n: DraftAppointment) => void; onRemove: () => void;
}) {
  const t = useTheme();
  return (
    <View style={[styles.draftBox, { backgroundColor: t.colors.surfaceAlt, borderColor: t.colors.border, borderRadius: t.radius.md }]}>
      <View style={styles.draftHeader}>
        <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.xs, fontWeight: '600' }}>ПРИЁМ {index + 1}</Text>
        <Ionicons name="close-circle" size={18} color={t.colors.danger} onPress={onRemove} />
      </View>
      <DatePickerField label="Дата" value={draft.date} onChange={d => onChange({ ...draft, date: d ?? draft.date })} allowClear={false} />
      <AppInput label="Описание" value={draft.description ?? ''} multiline onChangeText={text => onChange({ ...draft, description: text })} />
    </View>
  );
}

const styles = StyleSheet.create({
  draftBox: { borderWidth: 1, padding: 12, marginBottom: 10 },
  draftHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  fileRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 6 },
});
