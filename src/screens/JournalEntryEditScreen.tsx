import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Card } from '../components/Card';
import { AppInput } from '../components/AppInput';
import { AppButton } from '../components/AppButton';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { NotesStackParamList } from '../navigation/types';
import { JournalKind } from '../types';

type Props = NativeStackScreenProps<NotesStackParamList, 'JournalEntryEdit'>;

const KIND_OPTIONS: { kind: JournalKind; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { kind: 'note', label: 'Заметка', icon: 'document-text-outline' },
  { kind: 'wish', label: 'Желание', icon: 'sparkles-outline' },
  { kind: 'goal', label: 'Цель', icon: 'flag-outline' },
];

export function JournalEntryEditScreen({ navigation, route }: Props) {
  const t = useTheme();
  const { data, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useData();
  const entry = route.params.entryId ? data.journal.find(e => e.id === route.params.entryId) : null;

  const [kind, setKind] = useState<JournalKind>(entry?.kind ?? 'note');
  const [title, setTitle] = useState(entry?.title ?? '');
  const [text, setText] = useState(entry?.text ?? '');
  const [done, setDone] = useState<boolean>(entry?.done ?? false);
  const [error, setError] = useState<string | undefined>();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const onSave = () => {
    const trimmedTitle = title.trim();
    const trimmedText = text.trim();
    if (!trimmedTitle && !trimmedText) {
      setError('Запись пустая — введите заголовок или текст');
      return;
    }
    const payload = {
      kind,
      title: trimmedTitle || undefined,
      text: trimmedText,
      done: kind === 'goal' ? done : undefined,
    };
    if (entry) {
      updateJournalEntry(entry.id, payload);
    } else {
      addJournalEntry(payload);
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: t.spacing(4) }}>
        <Card>
          <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, marginBottom: 8 }}>Тип записи</Text>
          <View style={styles.kindRow}>
            {KIND_OPTIONS.map(opt => {
              const active = kind === opt.kind;
              return (
                <Pressable
                  key={opt.kind}
                  onPress={() => setKind(opt.kind)}
                  style={[
                    styles.kindBtn,
                    {
                      backgroundColor: active ? t.colors.primary : t.colors.surfaceAlt,
                      borderRadius: t.radius.md,
                    },
                  ]}
                >
                  <Ionicons name={opt.icon} size={18} color={active ? t.colors.textInverse : t.colors.text} />
                  <Text style={{
                    color: active ? t.colors.textInverse : t.colors.text,
                    fontWeight: '600',
                    fontSize: t.fontSize.sm,
                    marginTop: 4,
                  }}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card style={{ marginTop: 16 }}>
          <AppInput
            label="Заголовок"
            value={title}
            onChangeText={txt => { setTitle(txt); setError(undefined); }}
            placeholder="Опционально"
          />
          <AppInput
            label="Текст"
            value={text}
            onChangeText={txt => { setText(txt); setError(undefined); }}
            placeholder={kind === 'wish' ? 'Опишите желание' : kind === 'goal' ? 'Опишите цель' : 'Опишите мысль'}
            multiline
            error={error}
          />
          {kind === 'goal' ? (
            <Pressable onPress={() => setDone(d => !d)} style={styles.doneRow}>
              <Ionicons
                name={done ? 'checkbox' : 'square-outline'}
                size={22}
                color={done ? t.colors.primary : t.colors.textMuted}
              />
              <Text style={{ color: t.colors.text, fontSize: t.fontSize.md, marginLeft: 10 }}>
                Цель достигнута
              </Text>
            </Pressable>
          ) : null}
        </Card>

        <View style={{ marginTop: 16 }}>
          <AppButton title={entry ? 'Сохранить' : 'Создать'} onPress={onSave} fullWidth size="lg" />
        </View>

        {entry ? (
          <View style={{ marginTop: 10 }}>
            <AppButton
              title="Удалить запись"
              variant="danger"
              icon="trash-outline"
              fullWidth
              onPress={() => setConfirmDelete(true)}
            />
          </View>
        ) : null}
      </ScrollView>

      <ConfirmDialog
        visible={confirmDelete}
        title="Удалить запись?"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          if (entry) deleteJournalEntry(entry.id);
          navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  kindRow: { flexDirection: 'row', gap: 8 },
  kindBtn: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  doneRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
});
