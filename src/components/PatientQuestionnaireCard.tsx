import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { useTheme } from '../context/ThemeContext';
import { PatientQuestionnaire } from '../types';
import { formatDate } from '../utils/date';

interface Props {
  pq: PatientQuestionnaire;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function summarizeAnswer(value: any): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object' && 'value' in value) {
    const v = value.value === 'yes' ? 'Да' : value.value === 'no' ? 'Нет' : 'Не указано';
    return value.comment ? `${v} (${value.comment})` : v;
  }
  return '';
}

export function PatientQuestionnaireCard({ pq, onView, onEdit, onDelete }: Props) {
  const t = useTheme();
  const firstAnswered = pq.answers.find(a => {
    const s = summarizeAnswer(a.value);
    return s && s !== 'Не указано';
  });
  const firstQ = firstAnswered ? pq.questionsSnapshot.find(q => q.id === firstAnswered.questionId) : null;
  const preview = firstAnswered && firstQ
    ? `${firstQ.title}: ${summarizeAnswer(firstAnswered.value)}`
    : 'Заполнено';

  return (
    <Card onPress={onView} style={{ marginBottom: 10 }}>
      <View style={styles.row}>
        <View style={[styles.iconBox, { backgroundColor: t.colors.primarySoft, borderRadius: t.radius.md }]}>
          <Ionicons name="document-text-outline" size={20} color={t.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: t.colors.text, fontSize: t.fontSize.md, fontWeight: '600' }} numberOfLines={1}>
            {pq.templateTitle}
          </Text>
          <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.xs, marginTop: 2 }}>
            {formatDate(pq.completedAt)}
          </Text>
          <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, marginTop: 6 }} numberOfLines={2}>
            {preview}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 12 }}>
          <Ionicons name="create-outline" size={20} color={t.colors.primary} onPress={onEdit} />
          <Ionicons name="trash-outline" size={20} color={t.colors.danger} onPress={onDelete} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  iconBox: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
});
