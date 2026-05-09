import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { useTheme } from '../context/ThemeContext';
import { PatientFile } from '../types';
import { formatDate } from '../utils/date';

interface Props {
  file: PatientFile;
  onDelete: () => void;
}

function fileIcon(mime?: string): keyof typeof Ionicons.glyphMap {
  if (!mime) return 'document-outline';
  if (mime.startsWith('image/')) return 'image-outline';
  if (mime === 'application/pdf') return 'document-text-outline';
  if (mime.includes('word')) return 'document-text-outline';
  return 'document-outline';
}

function humanSize(size?: number): string {
  if (!size) return '';
  if (size < 1024) return `${size} Б`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} КБ`;
  return `${(size / (1024 * 1024)).toFixed(1)} МБ`;
}

export function FileCard({ file, onDelete }: Props) {
  const t = useTheme();
  return (
    <Card style={{ marginBottom: 10 }}>
      <View style={styles.row}>
        <View style={[styles.iconBox, { backgroundColor: t.colors.primarySoft, borderRadius: t.radius.md }]}>
          <Ionicons name={fileIcon(file.mimeType)} size={22} color={t.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: t.colors.text, fontSize: t.fontSize.md, fontWeight: '600' }} numberOfLines={1}>
            {file.name}
          </Text>
          <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.xs, marginTop: 4 }}>
            {[file.mimeType, humanSize(file.size), formatDate(file.addedAt)].filter(Boolean).join(' • ')}
          </Text>
        </View>
        <Ionicons name="trash-outline" size={20} color={t.colors.danger} onPress={onDelete} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
});
