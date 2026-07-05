import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { useData } from '../context/DataContext';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { DatePickerField } from '../components/DatePickerField';
import { QuestionnaireAnswerField } from '../components/QuestionnaireAnswerField';
import { todayISODate } from '../utils/date';
import { AnswerValue, QuestionnaireAnswer, QuestionnaireQuestion } from '../types';
import { PatientsStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<PatientsStackParamList, 'QuestionnaireFill'>;

export function QuestionnaireFillScreen({ navigation, route }: Props) {
  const t = useTheme();
  const { data, addPatientQuestionnaire, updatePatientQuestionnaire } = useData();
  const patient = data.patients.find(p => p.id === route.params.patientId);

  const existing = route.params.pqId ? patient?.questionnaires.find(q => q.id === route.params.pqId) : null;
  const template = existing
    ? null
    : route.params.templateId
      ? data.templates.find(tpl => tpl.id === route.params.templateId)
      : null;

  const initialQuestions: QuestionnaireQuestion[] = useMemo(() => {
    if (existing) return existing.questionsSnapshot;
    if (template) return [...template.questions].sort((a, b) => a.order - b.order);
    return [];
  }, [existing, template]);

  const [answers, setAnswers] = useState<QuestionnaireAnswer[]>(existing?.answers ?? []);
  const [completedAt, setCompletedAt] = useState(existing?.completedAt ?? todayISODate());
  const [error, setError] = useState<string | undefined>();

  if (!patient) return null;
  if (!existing && !template) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
        <Card style={{ margin: t.spacing(4) }}>
          <Text style={{ color: t.colors.text }}>Шаблон не найден.</Text>
        </Card>
      </SafeAreaView>
    );
  }

  const title = existing?.templateTitle ?? template?.title ?? '';

  const updateAnswer = (questionId: string, value: AnswerValue) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      if (existing) return prev.map(a => a.questionId === questionId ? { ...a, value } : a);
      return [...prev, { questionId, value }];
    });
  };

  const isAnswerEmpty = (q: QuestionnaireQuestion, ans?: QuestionnaireAnswer): boolean => {
    if (!ans) return true;
    const v = ans.value;
    if (v == null) return true;
    if (typeof v === 'string') return v.trim() === '';
    if (Array.isArray(v)) return v.length === 0;
    if (typeof v === 'object' && 'value' in v) return v.value == null;
    return false;
  };

  const validateAndSave = (mode: 'partial' | 'full') => {
    if (mode === 'full') {
      const missing = initialQuestions.find(q => q.required && isAnswerEmpty(q, answers.find(a => a.questionId === q.id)));
      if (missing) {
        setError(`Заполните обязательный вопрос: «${missing.title || 'без названия'}»`);
        return;
      }
    }
    setError(undefined);

    if (existing) {
      updatePatientQuestionnaire(patient.id, existing.id, {
        answers,
        completedAt,
      });
    } else if (template) {
      addPatientQuestionnaire({
        patientId: patient.id,
        templateId: template.id,
        templateTitle: template.title,
        questionsSnapshot: [...template.questions].sort((a, b) => a.order - b.order),
        answers,
        completedAt,
      });
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }} edges={['bottom']}>
      <ScreenHeader title="Анкета" />
      <ScrollView contentContainerStyle={{ padding: t.spacing(4), paddingBottom: 80 }}>
        <Card>
          <Text style={{ color: t.colors.text, fontSize: t.fontSize.xl, fontWeight: '700' }}>{title}</Text>
          <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, marginTop: 4 }}>
            Пациент: {patient.fullName}
          </Text>
          <View style={{ marginTop: 12 }}>
            <DatePickerField
              label="Дата заполнения"
              value={completedAt}
              onChange={d => setCompletedAt(d ?? todayISODate())}
              allowClear={false}
            />
          </View>
        </Card>

        <View style={{ marginTop: 16 }}>
          {initialQuestions.map(q => (
            <QuestionnaireAnswerField
              key={q.id}
              question={q}
              answer={answers.find(a => a.questionId === q.id)}
              onChange={(v) => { setError(undefined); updateAnswer(q.id, v); }}
            />
          ))}
        </View>

        {error ? (
          <Text style={{ color: t.colors.danger, fontSize: t.fontSize.sm, marginBottom: 12 }}>{error}</Text>
        ) : null}

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <AppButton title="Сохранить как есть" variant="secondary" fullWidth onPress={() => validateAndSave('partial')} />
          </View>
          <View style={{ flex: 1 }}>
            <AppButton title="Готово" fullWidth size="lg" onPress={() => validateAndSave('full')} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
