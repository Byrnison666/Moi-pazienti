import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { useTheme } from '../context/ThemeContext';
import { QuestionnaireTemplate } from '../types';

interface Props {
  template: QuestionnaireTemplate;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function QuestionnaireTemplateCard({ template, onPress, onEdit, onDelete }: Props) {
  const t = useTheme();
  return (
    <Card onPress={onPress} style={{ marginBottom: 12 }}>
      <View style={styles.row}>
        <View style={[styles.iconBox, { backgroundColor: t.colors.primarySoft, borderRadius: t.radius.md }]}>
          <Ionicons name="clipboard-outline" size={22} color={t.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: t.colors.text, fontSize: t.fontSize.md, fontWeight: '600' }} numberOfLines={1}>
            {template.title}
          </Text>
          {template.description ? (
            <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, marginTop: 4 }} numberOfLines={2}>
              {template.description}
            </Text>
          ) : null}
          <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.xs, marginTop: 6 }}>
            Вопросов: {template.questions.length}
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
  iconBox: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
});
