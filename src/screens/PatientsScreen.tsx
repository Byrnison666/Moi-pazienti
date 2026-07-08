import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme, useThemeControls } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { PatientCard } from '../components/PatientCard';
import { EmptyState } from '../components/EmptyState';
import { AppButton } from '../components/AppButton';
import { ListScreenHeader } from '../components/ListScreenHeader';
import { FilterChip } from '../components/FilterChip';
import { PatientsStackParamList } from '../navigation/types';
import { getFloatingActionBottom, getListBottomPadding } from '../navigation/tabBarMetrics';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { isFutureDate } from '../utils/date';

type Props = NativeStackScreenProps<PatientsStackParamList, 'PatientsList'>;
type Filter = 'all' | 'soon';

export function PatientsScreen({ navigation }: Props) {
  const t = useTheme();
  const { mode, setMode } = useThemeControls();
  const { data, ready } = useData();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const root = useNavigation();
  const insets = useSafeAreaInsets();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = [...data.patients].sort((a, b) => a.fullName.localeCompare(b.fullName, 'ru'));
    if (filter === 'soon') {
      list = list.filter(p => p.appointments.some(a => isFutureDate(a.date)));
    }
    if (q) list = list.filter(p => p.fullName.toLowerCase().includes(q));
    return list;
  }, [data.patients, query, filter]);

  const goToAdd = () => {
    root.dispatch(
      CommonActions.navigate({ name: 'AddPatientTab' as never })
    );
  };

  const goToSettings = () => {
    root.dispatch(
      CommonActions.navigate({ name: 'Settings' as never })
    );
  };

  const toggleDark = () => {
    setMode(t.mode === 'dark' ? 'light' : 'dark');
  };

  const hasQuery = query.trim().length > 0;
  const showFab = ready && !(data.patients.length === 0 && !hasQuery);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }} edges={['top']}>
      <ListScreenHeader
        eyebrow="Добрый день, доктор"
        title="Пациенты"
        subtitle={data.patients.length === 0 ? 'Список пуст' : `Всего в базе: ${data.patients.length}`}
        actions={[
          { icon: 'contrast-outline', onPress: toggleDark },
          { icon: 'settings-outline', onPress: goToSettings },
        ]}
      />

      <View style={[styles.searchBox, { backgroundColor: t.colors.surface, borderColor: t.colors.border, borderRadius: t.radius.md, marginHorizontal: t.spacing(4), marginTop: t.spacing(4) }]}>
        <Ionicons name="search" size={18} color={t.colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Поиск по ФИО"
          placeholderTextColor={t.colors.textMuted}
          style={{ flex: 1, color: t.colors.text, fontSize: t.fontSize.md, fontFamily: t.font.medium, marginLeft: 8 }}
        />
        {query ? (
          <Ionicons name="close-circle" size={18} color={t.colors.textMuted} onPress={() => setQuery('')} />
        ) : null}
      </View>

      <View style={[styles.filterRow, { marginHorizontal: t.spacing(4), marginTop: t.spacing(3) }]}>
        <FilterChip label="Все" icon="people-outline" active={filter === 'all'} onPress={() => setFilter('all')} />
        <FilterChip label="Скоро приём" icon="time-outline" active={filter === 'soon'} onPress={() => setFilter('soon')} />
      </View>

      {ready && filtered.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title={hasQuery || filter !== 'all' ? 'Никого не нашли' : 'Пациентов пока нет'}
          subtitle={hasQuery || filter !== 'all' ? 'Попробуйте уточнить запрос или фильтр' : 'Добавьте первого пациента, чтобы начать вести базу'}
          actionTitle={hasQuery || filter !== 'all' ? undefined : 'Добавить пациента'}
          onAction={hasQuery || filter !== 'all' ? undefined : goToAdd}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={p => p.id}
          contentContainerStyle={{ padding: t.spacing(4), paddingTop: t.spacing(4), paddingBottom: getListBottomPadding(insets.bottom) }}
          renderItem={({ item }) => (
            <PatientCard patient={item} onPress={() => navigation.navigate('PatientDetail', { patientId: item.id })} />
          )}
        />
      )}

      {showFab ? (
        <View style={[styles.fab, { bottom: getFloatingActionBottom(insets.bottom), right: t.spacing(4) }]}>
          <AppButton title="Добавить" icon="add" onPress={goToAdd} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1,
  },
  filterRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  fab: {
    position: 'absolute',
  },
});
