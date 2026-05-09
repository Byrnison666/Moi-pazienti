import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { QuestionnaireQuestion, QuestionType } from '../types';
import { AppInput } from './AppInput';
import { AppButton } from './AppButton';

const TYPE_LABELS: Record<QuestionType, string> = {
  short_text: 'Короткий текст',
  long_text: 'Большой текст',
  yes_no: 'Да / Нет / Не указано',
  yes_no_comment: 'Да / Нет / Не указано + комментарий',
  number: 'Число',
  scale_1_10: 'Шкала 1–10',
  single_choice: 'Один из списка',
  multi_choice: 'Несколько из списка',
  date: 'Дата',
  comment: 'Комментарий',
};

const TYPES: QuestionType[] = [
  'short_text', 'long_text', 'yes_no', 'yes_no_comment',
  'number', 'scale_1_10', 'single_choice', 'multi_choice',
  'date', 'comment',
];

const REQUIRES_OPTIONS: QuestionType[] = ['single_choice', 'multi_choice'];

interface Props {
  question: QuestionnaireQuestion;
  index: number;
  total: number;
  onChange: (q: QuestionnaireQuestion) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function QuestionnaireQuestionEditor({
  question, index, total, onChange, onDelete, onMoveUp, onMoveDown,
}: Props) {
  const t = useTheme();
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [newOption, setNewOption] = useState('');

  const updateOption = (i: number, value: string) => {
    const opts = [...(question.options ?? [])];
    opts[i] = value;
    onChange({ ...question, options: opts });
  };

  const removeOption = (i: number) => {
    const opts = [...(question.options ?? [])];
    opts.splice(i, 1);
    onChange({ ...question, options: opts });
  };

  const addOption = () => {
    if (!newOption.trim()) return;
    onChange({ ...question, options: [...(question.options ?? []), newOption.trim()] });
    setNewOption('');
  };

  return (
    <View style={[styles.wrap, { backgroundColor: t.colors.surfaceAlt, borderColor: t.colors.border, borderRadius: t.radius.md }]}>
      <View style={styles.headerRow}>
        <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.xs, fontWeight: '600' }}>
          ВОПРОС {index + 1}
        </Text>
        <View style={styles.actions}>
          {onMoveUp && index > 0 ? (
            <Pressable onPress={onMoveUp} hitSlop={8}>
              <Ionicons name="arrow-up" size={18} color={t.colors.primary} />
            </Pressable>
          ) : null}
          {onMoveDown && index < total - 1 ? (
            <Pressable onPress={onMoveDown} hitSlop={8}>
              <Ionicons name="arrow-down" size={18} color={t.colors.primary} />
            </Pressable>
          ) : null}
          <Pressable onPress={onDelete} hitSlop={8}>
            <Ionicons name="trash-outline" size={18} color={t.colors.danger} />
          </Pressable>
        </View>
      </View>

      <AppInput
        label="Текст вопроса"
        value={question.title}
        onChangeText={text => onChange({ ...question, title: text })}
        placeholder="Например: Есть ли аллергия?"
      />

      <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, marginBottom: 6 }}>Тип вопроса</Text>
      <Pressable
        onPress={() => setTypePickerOpen(o => !o)}
        style={[styles.typeBtn, { backgroundColor: t.colors.surface, borderColor: t.colors.border, borderRadius: t.radius.md }]}
      >
        <Text style={{ color: t.colors.text, fontSize: t.fontSize.md }}>{TYPE_LABELS[question.type]}</Text>
        <Ionicons name={typePickerOpen ? 'chevron-up' : 'chevron-down'} size={18} color={t.colors.textMuted} />
      </Pressable>

      {typePickerOpen ? (
        <ScrollView
          style={{ maxHeight: 220, marginTop: 8 }}
          contentContainerStyle={{ paddingVertical: 4 }}
        >
          {TYPES.map(tp => (
            <Pressable
              key={tp}
              onPress={() => {
                const next: QuestionnaireQuestion = { ...question, type: tp };
                if (REQUIRES_OPTIONS.includes(tp) && !next.options) next.options = [];
                onChange(next);
                setTypePickerOpen(false);
              }}
              style={[
                styles.typeOption,
                {
                  backgroundColor: question.type === tp ? t.colors.primarySoft : t.colors.surface,
                  borderColor: t.colors.border,
                },
              ]}
            >
              <Text style={{ color: t.colors.text, fontSize: t.fontSize.sm }}>{TYPE_LABELS[tp]}</Text>
              {question.type === tp ? (
                <Ionicons name="checkmark" size={16} color={t.colors.primary} />
              ) : null}
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      {(question.type === 'short_text' || question.type === 'long_text' || question.type === 'comment' || question.type === 'number') ? (
        <View style={{ marginTop: 12 }}>
          <AppInput
            label="Подсказка (placeholder)"
            value={question.placeholder ?? ''}
            onChangeText={text => onChange({ ...question, placeholder: text || undefined })}
            placeholder="Опционально"
          />
        </View>
      ) : null}

      {REQUIRES_OPTIONS.includes(question.type) ? (
        <View style={{ marginTop: 12 }}>
          <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, marginBottom: 6 }}>Варианты ответа</Text>
          {(question.options ?? []).map((opt, i) => (
            <View key={i} style={[styles.optRow, { backgroundColor: t.colors.surface, borderColor: t.colors.border, borderRadius: t.radius.sm }]}>
              <AppInput
                value={opt}
                onChangeText={text => updateOption(i, text)}
                containerStyle={{ flex: 1, marginBottom: 0 }}
                placeholder={`Вариант ${i + 1}`}
              />
              <Pressable onPress={() => removeOption(i)} hitSlop={8} style={{ marginLeft: 8 }}>
                <Ionicons name="close-circle" size={20} color={t.colors.danger} />
              </Pressable>
            </View>
          ))}
          <View style={[styles.optRow, { borderColor: t.colors.border, borderRadius: t.radius.sm, marginTop: 4 }]}>
            <AppInput
              value={newOption}
              onChangeText={setNewOption}
              placeholder="Новый вариант"
              containerStyle={{ flex: 1, marginBottom: 0 }}
              onSubmitEditing={addOption}
            />
            <View style={{ marginLeft: 8 }}>
              <AppButton title="Добавить" size="sm" onPress={addOption} />
            </View>
          </View>
        </View>
      ) : null}

      <Pressable
        onPress={() => onChange({ ...question, required: !question.required })}
        style={[styles.requiredRow, { marginTop: 14 }]}
      >
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: question.required ? t.colors.primary : 'transparent',
              borderColor: question.required ? t.colors.primary : t.colors.border,
              borderRadius: t.radius.sm,
            },
          ]}
        >
          {question.required ? <Ionicons name="checkmark" size={14} color={t.colors.textInverse} /> : null}
        </View>
        <Text style={{ color: t.colors.text, fontSize: t.fontSize.sm, marginLeft: 8 }}>Обязательный вопрос</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 1, padding: 14, marginBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 16 },
  typeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, paddingVertical: 12, paddingHorizontal: 14 },
  typeOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, marginBottom: 4, borderRadius: 8,
  },
  optRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  requiredRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 20, height: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
