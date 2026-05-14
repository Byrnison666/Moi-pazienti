export type ID = string;
export type ISODate = string;

export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'yes_no'
  | 'yes_no_comment'
  | 'number'
  | 'scale_1_10'
  | 'single_choice'
  | 'multi_choice'
  | 'date'
  | 'comment';

export interface QuestionnaireQuestion {
  id: ID;
  title: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  placeholder?: string;
  order: number;
}

export interface QuestionnaireTemplate {
  id: ID;
  title: string;
  description?: string;
  questions: QuestionnaireQuestion[];
  createdAt: ISODate;
  updatedAt: ISODate;
}

export type AnswerValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | { value: 'yes' | 'no' | 'unspecified' | null; comment?: string };

export interface QuestionnaireAnswer {
  questionId: ID;
  value: AnswerValue;
  comment?: string;
}

export interface PatientQuestionnaire {
  id: ID;
  patientId: ID;
  templateId: ID;
  templateTitle: string;
  /** Snapshot вопросов на момент заполнения, чтобы изменения шаблона не ломали историю. */
  questionsSnapshot: QuestionnaireQuestion[];
  answers: QuestionnaireAnswer[];
  completedAt: ISODate;
  updatedAt: ISODate;
}

export interface Note {
  id: ID;
  text: string;
  date: ISODate;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Appointment {
  id: ID;
  patientId: ID;
  date: ISODate;
  time?: string;
  description?: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface PatientFile {
  id: ID;
  name: string;
  uri: string;
  mimeType?: string;
  size?: number;
  addedAt: ISODate;
}

export interface Patient {
  id: ID;
  fullName: string;
  birthDate?: ISODate;
  age?: number;
  notes: Note[];
  appointments: Appointment[];
  files: PatientFile[];
  questionnaires: PatientQuestionnaire[];
  createdAt: ISODate;
  updatedAt: ISODate;
}

export type JournalKind = 'note' | 'wish' | 'goal';

export interface JournalEntry {
  id: ID;
  kind: JournalKind;
  title?: string;
  text: string;
  done?: boolean;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface AppData {
  patients: Patient[];
  templates: QuestionnaireTemplate[];
  /** Личный блокнот: заметки, желания, цели. Не связаны с пациентами. */
  journal: JournalEntry[];
  /** Для возможности отличать демо-данные. Список ID, добавленных как demo. */
  demoIds: {
    patients: ID[];
    templates: ID[];
  };
  /** ISO-метка последней мутации снапшота. Используется для LWW-синка. */
  updatedAt: ISODate;
  schemaVersion: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  themeMode: ThemeMode;
}
