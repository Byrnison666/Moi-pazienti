import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppData,
  Appointment,
  ID,
  JournalEntry,
  Note,
  Patient,
  PatientFile,
  PatientQuestionnaire,
  QuestionnaireTemplate,
} from '../types';
import { clearData, loadData, saveData, SCHEMA_VERSION, STORAGE_EMPTY } from '../storage';
import { buildDemoData } from '../storage/demo';
import { newId } from '../utils/id';
import { calcAge, nowISO } from '../utils/date';
import { bindAppState, schedulePush, setOnRemoteSnapshot, syncOnLaunch } from '../sync/syncManager';

interface DataContextValue {
  ready: boolean;
  data: AppData;

  // Patients
  addPatient: (p: Omit<Patient, 'id' | 'notes' | 'appointments' | 'files' | 'questionnaires' | 'createdAt' | 'updatedAt'> & {
    notes?: Note[]; appointments?: Appointment[]; files?: PatientFile[]; questionnaires?: PatientQuestionnaire[];
  }) => Patient;
  updatePatient: (id: ID, patch: Partial<Patient>) => void;
  deletePatient: (id: ID) => void;

  // Notes
  addNote: (patientId: ID, n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (patientId: ID, noteId: ID, patch: Partial<Note>) => void;
  deleteNote: (patientId: ID, noteId: ID) => void;

  // Appointments
  addAppointment: (patientId: ID, a: Omit<Appointment, 'id' | 'patientId' | 'createdAt' | 'updatedAt'>) => Appointment;
  updateAppointment: (patientId: ID, apptId: ID, patch: Partial<Appointment>) => void;
  deleteAppointment: (patientId: ID, apptId: ID) => void;

  // Files
  addFile: (patientId: ID, f: Omit<PatientFile, 'id' | 'addedAt'>) => void;
  deleteFile: (patientId: ID, fileId: ID) => void;

  // Templates
  addTemplate: (t: Omit<QuestionnaireTemplate, 'id' | 'createdAt' | 'updatedAt'>) => QuestionnaireTemplate;
  updateTemplate: (id: ID, patch: Partial<QuestionnaireTemplate>) => void;
  deleteTemplate: (id: ID) => void;

  // Patient questionnaires
  addPatientQuestionnaire: (q: Omit<PatientQuestionnaire, 'id' | 'updatedAt'>) => PatientQuestionnaire;
  updatePatientQuestionnaire: (patientId: ID, qId: ID, patch: Partial<PatientQuestionnaire>) => void;
  deletePatientQuestionnaire: (patientId: ID, qId: ID) => void;

  // Journal (личный блокнот)
  addJournalEntry: (e: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => JournalEntry;
  updateJournalEntry: (id: ID, patch: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: ID) => void;

  // Bulk ops
  resetAll: () => Promise<void>;
  clearDemo: () => void;
  reseedDemo: () => void;

  // Helpers
  getPatient: (id: ID) => Patient | undefined;
  getTemplate: (id: ID) => QuestionnaireTemplate | undefined;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<AppData>(STORAGE_EMPTY);
  const dataRef = useRef<AppData>(STORAGE_EMPTY);

  const persist = useCallback((next: AppData) => {
    const stamped: AppData = { ...next, updatedAt: nowISO(), schemaVersion: SCHEMA_VERSION };
    dataRef.current = stamped;
    setData(stamped);
    saveData(stamped);
    schedulePush(stamped);
  }, []);

  useEffect(() => {
    let mounted = true;
    bindAppState();
    setOnRemoteSnapshot((remote) => {
      if (!mounted) return;
      dataRef.current = remote;
      setData(remote);
      saveData(remote);
    });
    (async () => {
      const loaded = await loadData();
      let initial: AppData;
      if (loaded === null) {
        const { data: demo } = buildDemoData();
        initial = demo;
        dataRef.current = demo;
        setData(demo);
        await saveData(demo);
      } else {
        initial = loaded;
        dataRef.current = loaded;
        setData(loaded);
      }
      setReady(true);
      void syncOnLaunch(initial);
    })();
    return () => {
      mounted = false;
      setOnRemoteSnapshot(null);
    };
  }, []);

  const updatePatientById = (state: AppData, id: ID, fn: (p: Patient) => Patient): AppData => ({
    ...state,
    patients: state.patients.map(p => (p.id === id ? fn(p) : p)),
  });

  const value: DataContextValue = useMemo(() => ({
    ready,
    data,

    addPatient: (input) => {
      const id = newId();
      const t = nowISO();
      const patient: Patient = {
        id,
        fullName: input.fullName.trim(),
        birthDate: input.birthDate,
        age: input.age ?? calcAge(input.birthDate),
        notes: input.notes ?? [],
        appointments: (input.appointments ?? []).map(a => ({ ...a, patientId: id })),
        files: input.files ?? [],
        questionnaires: (input.questionnaires ?? []).map(q => ({ ...q, patientId: id })),
        createdAt: t,
        updatedAt: t,
      };
      persist({ ...dataRef.current, patients: [patient, ...dataRef.current.patients] });
      return patient;
    },

    updatePatient: (id, patch) => {
      persist(updatePatientById(dataRef.current, id, p => {
        const merged = { ...p, ...patch, updatedAt: nowISO() };
        if (patch.birthDate !== undefined && patch.age === undefined) {
          merged.age = calcAge(merged.birthDate);
        }
        return merged;
      }));
    },

    deletePatient: (id) => {
      persist({ ...dataRef.current, patients: dataRef.current.patients.filter(p => p.id !== id) });
    },

    addNote: (patientId, n) => {
      const t = nowISO();
      const note: Note = { id: newId(), createdAt: t, updatedAt: t, ...n };
      persist(updatePatientById(dataRef.current, patientId, p => ({
        ...p,
        notes: [note, ...p.notes],
        updatedAt: t,
      })));
    },

    updateNote: (patientId, noteId, patch) => {
      const t = nowISO();
      persist(updatePatientById(dataRef.current, patientId, p => ({
        ...p,
        notes: p.notes.map(n => n.id === noteId ? { ...n, ...patch, updatedAt: t } : n),
        updatedAt: t,
      })));
    },

    deleteNote: (patientId, noteId) => {
      const t = nowISO();
      persist(updatePatientById(dataRef.current, patientId, p => ({
        ...p,
        notes: p.notes.filter(n => n.id !== noteId),
        updatedAt: t,
      })));
    },

    addAppointment: (patientId, a) => {
      const t = nowISO();
      const appt: Appointment = { id: newId(), patientId, createdAt: t, updatedAt: t, ...a };
      persist(updatePatientById(dataRef.current, patientId, p => ({
        ...p,
        appointments: [appt, ...p.appointments],
        updatedAt: t,
      })));
      return appt;
    },

    updateAppointment: (patientId, apptId, patch) => {
      const t = nowISO();
      persist(updatePatientById(dataRef.current, patientId, p => ({
        ...p,
        appointments: p.appointments.map(a => a.id === apptId ? { ...a, ...patch, updatedAt: t } : a),
        updatedAt: t,
      })));
    },

    deleteAppointment: (patientId, apptId) => {
      const t = nowISO();
      persist(updatePatientById(dataRef.current, patientId, p => ({
        ...p,
        appointments: p.appointments.filter(a => a.id !== apptId),
        updatedAt: t,
      })));
    },

    addFile: (patientId, f) => {
      const t = nowISO();
      const file: PatientFile = { id: newId(), addedAt: t, ...f };
      persist(updatePatientById(dataRef.current, patientId, p => ({
        ...p,
        files: [file, ...p.files],
        updatedAt: t,
      })));
    },

    deleteFile: (patientId, fileId) => {
      const t = nowISO();
      persist(updatePatientById(dataRef.current, patientId, p => ({
        ...p,
        files: p.files.filter(f => f.id !== fileId),
        updatedAt: t,
      })));
    },

    addTemplate: (t) => {
      const at = nowISO();
      const tpl: QuestionnaireTemplate = { id: newId(), createdAt: at, updatedAt: at, ...t };
      persist({ ...dataRef.current, templates: [tpl, ...dataRef.current.templates] });
      return tpl;
    },

    updateTemplate: (id, patch) => {
      const at = nowISO();
      persist({
        ...dataRef.current,
        templates: dataRef.current.templates.map(t => t.id === id ? { ...t, ...patch, updatedAt: at } : t),
      });
    },

    deleteTemplate: (id) => {
      persist({ ...dataRef.current, templates: dataRef.current.templates.filter(t => t.id !== id) });
    },

    addPatientQuestionnaire: (q) => {
      const at = nowISO();
      const pq: PatientQuestionnaire = { id: newId(), updatedAt: at, ...q };
      persist(updatePatientById(dataRef.current, q.patientId, p => ({
        ...p,
        questionnaires: [pq, ...p.questionnaires],
        updatedAt: at,
      })));
      return pq;
    },

    updatePatientQuestionnaire: (patientId, qId, patch) => {
      const at = nowISO();
      persist(updatePatientById(dataRef.current, patientId, p => ({
        ...p,
        questionnaires: p.questionnaires.map(q => q.id === qId ? { ...q, ...patch, updatedAt: at } : q),
        updatedAt: at,
      })));
    },

    deletePatientQuestionnaire: (patientId, qId) => {
      const at = nowISO();
      persist(updatePatientById(dataRef.current, patientId, p => ({
        ...p,
        questionnaires: p.questionnaires.filter(q => q.id !== qId),
        updatedAt: at,
      })));
    },

    addJournalEntry: (e) => {
      const at = nowISO();
      const entry: JournalEntry = { id: newId(), createdAt: at, updatedAt: at, ...e };
      persist({ ...dataRef.current, journal: [entry, ...dataRef.current.journal] });
      return entry;
    },

    updateJournalEntry: (id, patch) => {
      const at = nowISO();
      persist({
        ...dataRef.current,
        journal: dataRef.current.journal.map(e => e.id === id ? { ...e, ...patch, updatedAt: at } : e),
      });
    },

    deleteJournalEntry: (id) => {
      persist({ ...dataRef.current, journal: dataRef.current.journal.filter(e => e.id !== id) });
    },

    resetAll: async () => {
      await clearData();
      const empty: AppData = {
        patients: [],
        templates: [],
        journal: [],
        demoIds: { patients: [], templates: [] },
        updatedAt: nowISO(),
        schemaVersion: 1,
      };
      persist(empty);
    },

    clearDemo: () => {
      const { demoIds } = dataRef.current;
      persist({
        ...dataRef.current,
        patients: dataRef.current.patients.filter(p => !demoIds.patients.includes(p.id)),
        templates: dataRef.current.templates.filter(t => !demoIds.templates.includes(t.id)),
        demoIds: { patients: [], templates: [] },
      });
    },

    reseedDemo: () => {
      const { data: demo } = buildDemoData();
      persist({
        ...dataRef.current,
        patients: [...demo.patients, ...dataRef.current.patients],
        templates: [...demo.templates, ...dataRef.current.templates],
        demoIds: {
          patients: [...dataRef.current.demoIds.patients, ...demo.demoIds.patients],
          templates: [...dataRef.current.demoIds.templates, ...demo.demoIds.templates],
        },
      });
    },

    getPatient: (id) => dataRef.current.patients.find(p => p.id === id),
    getTemplate: (id) => dataRef.current.templates.find(t => t.id === id),
  }), [data, ready, persist]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be inside DataProvider');
  return ctx;
}
