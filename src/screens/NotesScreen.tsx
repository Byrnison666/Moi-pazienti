import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { AppButton } from '../components/AppButton';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { JournalEntry, JournalKind } from '../types';
import { getFloatingActionBottom, getListBottomPadding } from '../navigation/tabBarMetrics';

type Filter = 'all' | JournalKind;

const KIND_META: Record<JournalKind, { label: string; icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap }> = {
  note: { label: 'Заметка', icon: 'document-text-outline' },
  wish: { label: 'Желание', icon: 'sparkles-outline' },
  goal: { label: 'Цель', icon: 'flag-outline' },
};

export function NotesScreen() {
  const t = useTheme();
  const { data, updateJournalEntry, deleteJournalEntry } = useData();
  const nav = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const sorted = useMemo(() => {
    return [...data.journal].sort((a, b) => {
      // незавершённые цели первыми, потом по дате обновления
      const aDone = a.kind === 'goal' && a.done ? 1 : 0;
      const bDone = b.kind === 'goal' && b.done ? 1 : 0;
      if (aDone !== bDone) return aDone - bDone;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [data.journal]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter(e => {
      if (filter !== 'all' && e.kind !== filter) return false;
      if (!q) return true;
      return (e.title?.toLowerCase().includes(q) ?? false) || e.text.toLowerCase().includes(q);
    });
  }, [sorted, query, filter]);

  const counts = useMemo(() => ({
    all: data.journal.length,
    note: data.journal.filter(e => e.kind === 'note').length,
    wish: data.journal.filter(e => e.kind === 'wish').length,
    goal: data.journal.filter(e => e.kind === 'goal').length,
  }), [data.journal]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }} edges={['top']}>
      <View style={{ paddingHorizontal: t.spacing(4), paddingTop: t.spacing(2) }}>
        <Text style={{ color: t.colors.text, fontSize: t.fontSize.xxl, fontWeight: '700' }}>Заметки</Text>
        <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, marginTop: 2 }}>
          Личные заметки, желания и цели
        </Text>
      </View>

      <View style={[styles.searchBox, {
        backgroundColor: t.colors.surface, borderColor: t.colors.border, borderRadius: t.radius.md,
        marginHorizontal: t.spacing(4), marginTop: t.spacing(3),
      }]}>
        <Ionicons name="search" size={18} color={t.colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Поиск"
          placeholderTextColor={t.colors.textMuted}
          style={{ flex: 1, color: t.colors.text, fontSize: t.fontSize.md, marginLeft: 8 }}
        />
        {query ? (
          <Ionicons name="close-circle" size={18} color={t.colors.textMuted} onPress={() => setQuery('')} />
        ) : null}
      </View>

      <View style={[styles.filterRow, { marginHorizontal: t.spacing(4), marginTop: t.spacing(2) }]}>
        <FilterChip label={`Всё (${counts.all})`} active={filter === 'all'} onPress={() => setFilter('all')} />
        <FilterChip label={`Заметки (${counts.note})`} active={filter === 'note'} onPress={() => setFilter('note')} />
        <FilterChip label={`Желания (${counts.wish})`} active={filter === 'wish'} onPress={() => setFilter('wish')} />
        <FilterChip label={`Цели (${counts.goal})`} active={filter === 'goal'} onPress={() => setFilter('goal')} />
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          icon="book-outline"
          title={query || filter !== 'all' ? 'Ничего не нашли' : 'Заметок пока нет'}
          subtitle={
            query || filter !== 'all'
              ? 'Попробуйте сменить фильтр или запрос'
              : 'Запишите свои хотелки, цели или просто мысли. Нажмите «Добавить запись».'
          }
          actionTitle={query || filter !== 'all' ? undefined : 'Добавить запись'}
          onAction={query || filter !== 'all' ? undefined : () => nav.navigate('JournalEntryEdit', {})}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={e => e.id}
          contentContainerStyle={{ padding: t.spacing(4), paddingTop: t.spacing(3), paddingBottom: getListBottomPadding(insets.bottom) }}
          renderItem={({ item }) => (
            <EntryCard
              entry={item}
              onPress={() => nav.navigate('JournalEntryEdit', { entryId: item.id })}
              onToggleDone={
                item.kind === 'goal'
                  ? () => updateJournalEntry(item.id, { done: !item.done })
                  : undefined
              }
              onDelete={() => setConfirmDeleteId(item.id)}
            />
          )}
        />
      )}

      {!(query.trim() === '' && filter === 'all' && data.journal.length === 0) ? (
        <View style={{ position: 'absolute', bottom: getFloatingActionBottom(insets.bottom), right: t.spacing(4) }}>
          <AppButton title="Добавить" icon="add" onPress={() => nav.navigate('JournalEntryEdit', {})} />
        </View>
      ) : null}

      <ConfirmDialog
        visible={!!confirmDeleteId}
        title="Удалить запись?"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) deleteJournalEntry(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
      />
    </SafeAreaView>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? t.colors.primary : t.colors.surfaceAlt,
          borderRadius: t.radius.sm,
        },
      ]}
    >
      <Text style={{
        color: active ? t.colors.textInverse : t.colors.text,
        fontWeight: '600',
        fontSize: t.fontSize.xs,
      }}>{label}</Text>
    </Pressable>
  );
}

function EntryCard({
  entry, onPress, onToggleDone, onDelete,
}: {
  entry: JournalEntry;
  onPress: () => void;
  onToggleDone?: () => void;
  onDelete: () => void;
}) {
  const t = useTheme();
  const meta = KIND_META[entry.kind];
  const dimmed = entry.kind === 'goal' && entry.done;
  return (
    <Pressable onPress={onPress}>
      <Card style={{ marginBottom: 10, opacity: dimmed ? 0.55 : 1 }}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={[styles.iconBox, { backgroundColor: t.colors.primarySoft, borderRadius: t.radius.sm }]}>
              <Ionicons name={meta.icon} size={14} color={t.colors.primary} />
            </View>
            <Text style={{ color: t.colors.primary, fontSize: t.fontSize.xs, fontWeight: '600', marginLeft: 6 }}>
              {meta.label.toUpperCase()}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 14 }}>
            {onToggleDone ? (
              <Ionicons
                name={entry.done ? 'checkbox' : 'square-outline'}
                size={20}
                color={entry.done ? t.colors.primary : t.colors.textMuted}
                onPress={onToggleDone}
              />
            ) : null}
            <Ionicons name="trash-outline" size={18} color={t.colors.danger} onPress={onDelete} />
          </View>
        </View>
        {entry.title ? (
          <Text style={{
            color: t.colors.text, fontSize: t.fontSize.md, fontWeight: '700', marginTop: 8,
            textDecorationLine: dimmed ? 'line-through' : 'none',
          }}>
            {entry.title}
          </Text>
        ) : null}
        {entry.text ? (
          <Text style={{ color: t.colors.text, fontSize: t.fontSize.sm, marginTop: entry.title ? 4 : 8, lineHeight: 20 }} numberOfLines={5}>
            {entry.text}
          </Text>
        ) : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1,
  },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 6 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBox: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
});
