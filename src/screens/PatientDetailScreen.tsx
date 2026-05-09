import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { NoteCard } from '../components/NoteCard';
import { AppointmentCard } from '../components/AppointmentCard';
import { FileCard } from '../components/FileCard';
import { PatientQuestionnaireCard } from '../components/PatientQuestionnaireCard';
import { ageText, calcAge, compareDates, formatDateLong } from '../utils/date';
import { PatientsStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<PatientsStackParamList, 'PatientDetail'>;

export function PatientDetailScreen({ navigation, route }: Props) {
  const t = useTheme();
  const { data, deletePatient, addFile, deleteFile, deleteAppointment, deleteNote, deletePatientQuestionnaire } = useData();
  const patient = data.patients.find(p => p.id === route.params.patientId);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmNoteId, setConfirmNoteId] = useState<string | null>(null);
  const [confirmApptId, setConfirmApptId] = useState<string | null>(null);
  const [confirmFileId, setConfirmFileId] = useState<string | null>(null);
  const [confirmPqId, setConfirmPqId] = useState<string | null>(null);
  const [pickQuestionnaire, setPickQuestionnaire] = useState(false);

  if (!patient) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
        <EmptyState icon="alert-circle-outline" title="Пациент не найден" />
      </SafeAreaView>
    );
  }

  const age = patient.age ?? calcAge(patient.birthDate);

  const sortedAppointments = [...patient.appointments].sort((a, b) => compareDates(a.date, b.date));
  const sortedNotes = [...patient.notes].sort((a, b) => compareDates(b.date, a.date));

  const onPickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false });
      if (res.canceled) return;
      const asset = res.assets[0];
      addFile(patient.id, {
        name: asset.name,
        uri: asset.uri,
        mimeType: asset.mimeType ?? undefined,
        size: asset.size ?? undefined,
      });
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось добавить файл');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: t.spacing(4), paddingBottom: 60 }}>
        <Card style={{ marginBottom: 16 }}>
          <View style={styles.headerRow}>
            <View style={[styles.avatar, { backgroundColor: t.colors.primarySoft }]}>
              <Text style={{ color: t.colors.primary, fontSize: 22, fontWeight: '700' }}>
                {patient.fullName.split(/\s+/).slice(0, 2).map(s => s[0]?.toUpperCase()).join('')}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.colors.text, fontSize: t.fontSize.xl, fontWeight: '700' }}>{patient.fullName}</Text>
              {patient.birthDate ? (
                <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, marginTop: 4 }}>
                  {formatDateLong(patient.birthDate)}{age != null ? ` • ${ageText(age)}` : ''}
                </Text>
              ) : age != null ? (
                <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, marginTop: 4 }}>{ageText(age)}</Text>
              ) : null}
            </View>
          </View>

          <View style={[styles.actions, { marginTop: 14 }]}>
            <AppButton title="Редактировать" icon="create-outline" variant="secondary" size="sm"
              onPress={() => navigation.navigate('EditPatient', { patientId: patient.id })} />
            <AppButton title="Удалить" icon="trash-outline" variant="danger" size="sm"
              onPress={() => setConfirmDelete(true)} />
          </View>
        </Card>

        <SectionHeader icon="document-text-outline" title="Заметки врача" count={patient.notes.length}
          action={<AppButton title="Добавить" icon="add" size="sm" variant="secondary"
            onPress={() => navigation.navigate('NoteEdit', { patientId: patient.id })} />}
        />
        {sortedNotes.length === 0 ? (
          <EmptyTextHint text="Заметок пока нет. Добавьте важные особенности пациента." />
        ) : (
          sortedNotes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={() => navigation.navigate('NoteEdit', { patientId: patient.id, noteId: note.id })}
              onDelete={() => setConfirmNoteId(note.id)}
            />
          ))
        )}

        <SectionHeader icon="calendar-outline" title="Приемы" count={patient.appointments.length}
          action={<AppButton title="Добавить" icon="add" size="sm" variant="secondary"
            onPress={() => navigation.navigate('AppointmentEdit', { patientId: patient.id })} />}
        />
        {sortedAppointments.length === 0 ? (
          <EmptyTextHint text="Приемов пока нет." />
        ) : (
          sortedAppointments.map(a => (
            <AppointmentCard
              key={a.id}
              appointment={a}
              onPress={() => navigation.navigate('AppointmentEdit', { patientId: patient.id, appointmentId: a.id })}
              onEdit={() => navigation.navigate('AppointmentEdit', { patientId: patient.id, appointmentId: a.id })}
              onDelete={() => setConfirmApptId(a.id)}
            />
          ))
        )}

        <SectionHeader icon="attach-outline" title="Файлы" count={patient.files.length}
          action={<AppButton title="Прикрепить" icon="attach" size="sm" variant="secondary" onPress={onPickFile} />}
        />
        {patient.files.length === 0 ? (
          <EmptyTextHint text="Прикрепите снимки, заключения, PDF — кнопка со скрепкой выше." />
        ) : (
          patient.files.map(f => (
            <FileCard key={f.id} file={f} onDelete={() => setConfirmFileId(f.id)} />
          ))
        )}

        <SectionHeader icon="clipboard-outline" title="Анкеты" count={patient.questionnaires.length}
          action={<AppButton title="Заполнить" icon="add" size="sm" variant="secondary"
            onPress={() => setPickQuestionnaire(true)} />}
        />
        {patient.questionnaires.length === 0 ? (
          <EmptyTextHint text="Заполните анкету для пациента — выберите шаблон в разделе «Анкеты»." />
        ) : (
          patient.questionnaires.map(q => (
            <PatientQuestionnaireCard
              key={q.id}
              pq={q}
              onView={() => navigation.navigate('QuestionnaireView', { patientId: patient.id, pqId: q.id })}
              onEdit={() => navigation.navigate('QuestionnaireFill', { patientId: patient.id, pqId: q.id })}
              onDelete={() => setConfirmPqId(q.id)}
            />
          ))
        )}
      </ScrollView>

      <ConfirmDialog
        visible={confirmDelete}
        title="Удалить пациента?"
        message="Все заметки, приемы, файлы и анкеты этого пациента будут удалены без возможности восстановления."
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          deletePatient(patient.id);
          navigation.goBack();
        }}
      />
      <ConfirmDialog
        visible={!!confirmNoteId}
        title="Удалить заметку?"
        onCancel={() => setConfirmNoteId(null)}
        onConfirm={() => {
          if (confirmNoteId) deleteNote(patient.id, confirmNoteId);
          setConfirmNoteId(null);
        }}
      />
      <ConfirmDialog
        visible={!!confirmApptId}
        title="Удалить прием?"
        onCancel={() => setConfirmApptId(null)}
        onConfirm={() => {
          if (confirmApptId) deleteAppointment(patient.id, confirmApptId);
          setConfirmApptId(null);
        }}
      />
      <ConfirmDialog
        visible={!!confirmFileId}
        title="Удалить файл?"
        onCancel={() => setConfirmFileId(null)}
        onConfirm={() => {
          if (confirmFileId) deleteFile(patient.id, confirmFileId);
          setConfirmFileId(null);
        }}
      />
      <ConfirmDialog
        visible={!!confirmPqId}
        title="Удалить заполненную анкету?"
        onCancel={() => setConfirmPqId(null)}
        onConfirm={() => {
          if (confirmPqId) deletePatientQuestionnaire(patient.id, confirmPqId);
          setConfirmPqId(null);
        }}
      />

      <PickTemplateDialog
        visible={pickQuestionnaire}
        onCancel={() => setPickQuestionnaire(false)}
        onPick={(templateId) => {
          setPickQuestionnaire(false);
          navigation.navigate('QuestionnaireFill', { patientId: patient.id, templateId });
        }}
      />
    </SafeAreaView>
  );
}

function SectionHeader({ icon, title, count, action }: {
  icon: keyof typeof Ionicons.glyphMap; title: string; count: number; action?: React.ReactNode;
}) {
  const t = useTheme();
  return (
    <View style={[styles.sectionHeader, { marginTop: 24, marginBottom: 10 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <Ionicons name={icon} size={18} color={t.colors.primary} />
        <Text style={{ color: t.colors.text, fontSize: t.fontSize.lg, fontWeight: '700', marginLeft: 8 }}>{title}</Text>
        {count > 0 ? (
          <View style={{ backgroundColor: t.colors.primarySoft, paddingHorizontal: 8, borderRadius: 10, marginLeft: 8 }}>
            <Text style={{ color: t.colors.primary, fontSize: t.fontSize.xs, fontWeight: '600' }}>{count}</Text>
          </View>
        ) : null}
      </View>
      {action}
    </View>
  );
}

function EmptyTextHint({ text }: { text: string }) {
  const t = useTheme();
  return (
    <Card style={{ paddingVertical: 18 }}>
      <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, textAlign: 'center' }}>{text}</Text>
    </Card>
  );
}

function PickTemplateDialog({
  visible, onCancel, onPick,
}: { visible: boolean; onCancel: () => void; onPick: (id: string) => void }) {
  const t = useTheme();
  const { data } = useData();
  if (!visible) return null;
  return (
    <View style={[styles.modalOverlay, { backgroundColor: t.colors.overlay }]}>
      <View style={{ backgroundColor: t.colors.surface, borderRadius: t.radius.lg, padding: t.spacing(5), width: '100%', maxWidth: 460 }}>
        <Text style={{ color: t.colors.text, fontSize: t.fontSize.lg, fontWeight: '700', marginBottom: 12 }}>
          Выберите анкету
        </Text>
        {data.templates.length === 0 ? (
          <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, marginBottom: 16 }}>
            Сначала создайте шаблон анкеты во вкладке «Анкеты».
          </Text>
        ) : (
          <View style={{ marginBottom: 12 }}>
            {data.templates.map(tpl => (
              <View key={tpl.id} style={{ marginBottom: 8 }}>
                <AppButton title={tpl.title} variant="secondary" fullWidth onPress={() => onPick(tpl.id)} />
              </View>
            ))}
          </View>
        )}
        <AppButton title="Закрыть" variant="ghost" fullWidth onPress={onCancel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  actions: { flexDirection: 'row', gap: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', padding: 20,
  },
});
