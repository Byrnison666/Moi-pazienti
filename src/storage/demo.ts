import { AppData, Patient, QuestionnaireTemplate } from '../types';
import { newId } from '../utils/id';
import { nowISO, todayISODate } from '../utils/date';

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function buildDemoData(): { data: AppData } {
  const now = nowISO();
  const today = todayISODate();

  const tplId = newId();
  const q1 = newId();
  const q2 = newId();
  const q3 = newId();
  const q4 = newId();
  const q5 = newId();

  const template: QuestionnaireTemplate = {
    id: tplId,
    title: 'Анамнез — базовый',
    description: 'Краткий пример анкеты. Можно изменить или удалить.',
    questions: [
      { id: q1, title: 'Есть ли аллергия на медикаменты?', type: 'yes_no_comment', required: true, order: 0 },
      { id: q2, title: 'Принимаете ли Вы лекарства постоянно?', type: 'yes_no', required: false, order: 1 },
      { id: q3, title: 'Уровень тревожности перед лечением', type: 'scale_1_10', required: false, order: 2 },
      { id: q4, title: 'Хронические заболевания', type: 'multi_choice', required: false,
        options: ['Гипертония', 'Сахарный диабет', 'Заболевания сердца', 'Астма', 'Эпилепсия'], order: 3 },
      { id: q5, title: 'Дополнительные комментарии', type: 'long_text', required: false, placeholder: 'Любая важная информация', order: 4 },
    ],
    createdAt: now,
    updatedAt: now,
  };

  const patient1Id = newId();
  const patient2Id = newId();

  const patient1: Patient = {
    id: patient1Id,
    fullName: 'Иванова Мария Сергеевна',
    birthDate: '1986-04-12',
    notes: [
      {
        id: newId(),
        text: 'Боится анестезии — использовать успокаивающую беседу. Рекомендована премедикация.',
        date: today,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: newId(),
        text: 'Аллергия на лидокаин, использовать артикаин.',
        date: today,
        createdAt: now,
        updatedAt: now,
      },
    ],
    appointments: [
      {
        id: newId(),
        patientId: patient1Id,
        date: addDays(today, 2),
        time: '10:30',
        description: 'Контрольный осмотр после лечения 36 зуба.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: newId(),
        patientId: patient1Id,
        date: addDays(today, 14),
        time: '15:00',
        description: 'Профессиональная гигиена.',
        createdAt: now,
        updatedAt: now,
      },
    ],
    files: [],
    questionnaires: [
      {
        id: newId(),
        patientId: patient1Id,
        templateId: tplId,
        templateTitle: template.title,
        questionsSnapshot: template.questions,
        answers: [
          { questionId: q1, value: { value: 'yes', comment: 'Лидокаин' } },
          { questionId: q2, value: false },
          { questionId: q3, value: 7 },
          { questionId: q4, value: ['Гипертония'] },
          { questionId: q5, value: 'Просит детально объяснять каждый этап лечения.' },
        ],
        completedAt: today,
        updatedAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  const patient2: Patient = {
    id: patient2Id,
    fullName: 'Петров Алексей Викторович',
    birthDate: '1992-09-23',
    notes: [],
    appointments: [
      {
        id: newId(),
        patientId: patient2Id,
        date: addDays(today, 5),
        time: '12:00',
        description: 'Лечение кариеса 26 зуба.',
        createdAt: now,
        updatedAt: now,
      },
    ],
    files: [],
    questionnaires: [],
    createdAt: now,
    updatedAt: now,
  };

  const data: AppData = {
    patients: [patient1, patient2],
    templates: [template],
    demoIds: {
      patients: [patient1Id, patient2Id],
      templates: [tplId],
    },
  };

  return { data };
}
