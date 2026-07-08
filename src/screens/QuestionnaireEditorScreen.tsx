import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { useData } from '../context/DataContext';
import { Card } from '../components/Card';
import { AppInput } from '../components/AppInput';
import { AppButton } from '../components/AppButton';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { QuestionnaireQuestionEditor } from '../components/QuestionnaireQuestionEditor';
import { newId } from '../utils/id';
import { QuestionnaireQuestion } from '../types';
import { QuestionnairesStackParamList } from '../navigation/types';
import { getListBottomPadding } from '../navigation/tabBarMetrics';

type Props = NativeStackScreenProps<QuestionnairesStackParamList, 'QuestionnaireEditor'>;

export function QuestionnaireEditorScreen({ navigation, route }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { data, addTemplate, updateTemplate } = useData();
  const editing = route.params.templateId ? data.templates.find(tpl => tpl.id === route.params.templateId) : null;

  const [title, setTitle] = useState(editing?.title ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [questions, setQuestions] = useState<QuestionnaireQuestion[]>(editing?.questions ?? []);
  const [titleError, setTitleError] = useState<string | undefined>();
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState<number | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const updateQuestion = (i: number, q: QuestionnaireQuestion) => {
    setQuestions(prev => prev.map((x, idx) => idx === i ? q : x));
  };

  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      { id: newId(), title: '', type: 'short_text', required: false, order: prev.length },
    ]);
  };

  const removeQuestion = (i: number) => {
    setQuestions(prev => prev.filter((_, idx) => idx !== i).map((q, idx) => ({ ...q, order: idx })));
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= questions.length) return;
    const next = [...questions];
    [next[i], next[j]] = [next[j], next[i]];
    setQuestions(next.map((q, idx) => ({ ...q, order: idx })));
  };

  const onSave = () => {
    const t = title.trim();
    if (!t) {
      setTitleError('Укажите название анкеты');
      return;
    }
    const cleaned = questions
      .map((q, idx) => ({
        ...q,
        title: q.title.trim() || `Вопрос ${idx + 1}`,
        order: idx,
        options: q.type === 'single_choice' || q.type === 'multi_choice'
          ? (q.options ?? []).map(o => o.trim()).filter(Boolean)
          : undefined,
      }));

    if (editing) {
      updateTemplate(editing.id, { title: t, description: description.trim() || undefined, questions: cleaned });
    } else {
      addTemplate({ title: t, description: description.trim() || undefined, questions: cleaned });
    }
    navigation.goBack();
  };

  const dirty = (editing?.title ?? '') !== title
    || (editing?.description ?? '') !== description
    || JSON.stringify(editing?.questions ?? []) !== JSON.stringify(questions);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }} edges={['bottom']}>
      <ScreenHeader title="Шаблон анкеты" />
      <ScrollView contentContainerStyle={{ padding: t.spacing(4), paddingBottom: getListBottomPadding(insets.bottom) }}>
        <Card>
          <AppInput
            label="Название"
            required
            value={title}
            onChangeText={text => { setTitle(text); setTitleError(undefined); }}
            placeholder="Например: Анамнез"
            error={titleError}
          />
          <AppInput
            label="Описание"
            value={description}
            onChangeText={setDescription}
            placeholder="Опционально"
            multiline
          />
        </Card>

        <View style={[styles.questionsHeader, { marginTop: 20 }]}>
          <Text style={{ color: t.colors.text, fontSize: t.fontSize.lg, fontWeight: '700' }}>
            Вопросы {questions.length > 0 ? `(${questions.length})` : ''}
          </Text>
        </View>

        {questions.length === 0 ? (
          <Card style={{ marginTop: 8, paddingVertical: 18 }}>
            <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, textAlign: 'center' }}>
              Добавьте первый вопрос — выберите тип, текст и при необходимости варианты.
            </Text>
          </Card>
        ) : (
          questions.map((q, i) => (
            <QuestionnaireQuestionEditor
              key={q.id}
              question={q}
              index={i}
              total={questions.length}
              onChange={(next) => updateQuestion(i, next)}
              onDelete={() => setConfirmDeleteIdx(i)}
              onMoveUp={() => move(i, -1)}
              onMoveDown={() => move(i, 1)}
            />
          ))
        )}

        <View style={{ marginTop: 8 }}>
          <AppButton title="Добавить вопрос" icon="add" variant="secondary" onPress={addQuestion} fullWidth />
        </View>

        <View style={{ marginTop: 20, flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <AppButton title="Отмена" variant="ghost" fullWidth onPress={() => dirty ? setConfirmCancel(true) : navigation.goBack()} />
          </View>
          <View style={{ flex: 2 }}>
            <AppButton title={editing ? 'Сохранить' : 'Создать анкету'} onPress={onSave} fullWidth size="lg" />
          </View>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={confirmDeleteIdx !== null}
        title="Удалить вопрос?"
        onCancel={() => setConfirmDeleteIdx(null)}
        onConfirm={() => {
          if (confirmDeleteIdx !== null) removeQuestion(confirmDeleteIdx);
          setConfirmDeleteIdx(null);
        }}
      />
      <ConfirmDialog
        visible={confirmCancel}
        title="Отменить изменения?"
        message="Несохранённые изменения будут потеряны."
        confirmTitle="Отменить"
        onCancel={() => setConfirmCancel(false)}
        onConfirm={() => { setConfirmCancel(false); navigation.goBack(); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  questionsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
});
