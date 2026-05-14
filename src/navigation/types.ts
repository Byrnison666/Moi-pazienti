import { NavigatorScreenParams } from '@react-navigation/native';

export type PatientsStackParamList = {
  PatientsList: undefined;
  PatientDetail: { patientId: string };
  EditPatient: { patientId: string };
  AppointmentEdit: { patientId: string; appointmentId?: string; initialDate?: string };
  NoteEdit: { patientId: string; noteId?: string };
  QuestionnaireFill: { patientId: string; templateId?: string; pqId?: string };
  QuestionnaireView: { patientId: string; pqId: string };
};

export type ScheduleStackParamList = {
  ScheduleList: undefined;
  PatientDetail: { patientId: string };
  AppointmentEdit: { patientId: string; appointmentId?: string; initialDate?: string };
  PickPatientForAppointment: undefined;
};

export type AddPatientStackParamList = {
  AddPatient: undefined;
  PatientDetail: { patientId: string };
};

export type QuestionnairesStackParamList = {
  QuestionnairesList: undefined;
  QuestionnaireEditor: { templateId?: string };
};

export type NotesStackParamList = {
  NotesList: undefined;
  JournalEntryEdit: { entryId?: string };
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
  SyncSettings: undefined;
};

export type RootTabParamList = {
  PatientsTab: NavigatorScreenParams<PatientsStackParamList>;
  ScheduleTab: NavigatorScreenParams<ScheduleStackParamList>;
  AddPatientTab: NavigatorScreenParams<AddPatientStackParamList>;
  NotesTab: NavigatorScreenParams<NotesStackParamList>;
  QuestionnairesTab: NavigatorScreenParams<QuestionnairesStackParamList>;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};
