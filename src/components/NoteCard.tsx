import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { useTheme } from '../context/ThemeContext';
import { Note } from '../types';
import { formatDate } from '../utils/date';

interface Props {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
}

export function NoteCard({ note, onEdit, onDelete }: Props) {
  const t = useTheme();
  return (
    <Card style={{ marginBottom: 10 }}>
      <View style={styles.headerRow}>
        <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.xs }}>{formatDate(note.date)}</Text>
        <View style={{ flexDirection: 'row', gap: 14 }}>
          <Ionicons name="create-outline" size={18} color={t.colors.primary} onPress={onEdit} />
          <Ionicons name="trash-outline" size={18} color={t.colors.danger} onPress={onDelete} />
        </View>
      </View>
      <Text style={{ color: t.colors.text, fontSize: t.fontSize.md, marginTop: 8, lineHeight: 22 }}>
        {note.text}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
