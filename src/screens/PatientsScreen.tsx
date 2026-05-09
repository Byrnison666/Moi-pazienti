import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { PatientCard } from '../components/PatientCard';
import { EmptyState } from '../components/EmptyState';
import { AppButton } from '../components/AppButton';
import { PatientsStackParamList } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';

type Props = NativeStackScreenProps<PatientsStackParamList, 'PatientsList'>;

export function PatientsScreen({ navigation }: Props) {
  const t = useTheme();
  const { data, ready } = useData();
  const [query, setQuery] = useState('');
  const root = useNavigation();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...data.patients].sort((a, b) => a.fullName.localeCompare(b.fullName, 'ru'));
    if (!q) return list;
    return list.filter(p => p.fullName.toLowerCase().includes(q));
  }, [data.patients, query]);

  const goToAdd = () => {
    root.dispatch(
      CommonActions.navigate({ name: 'AddPatientTab' as never })
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }} edges={['top']}>
      <View style={[styles.header, { paddingHorizontal: t.spacing(4), paddingTop: t.spacing(2) }]}>
        <Text style={{ color: t.colors.text, fontSize: t.fontSize.xxl, fontWeight: '700' }}>Пациенты</Text>
        <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, marginTop: 2 }}>
          {data.patients.length === 0 ? 'Список пуст' : `Всего: ${data.patients.length}`}
        </Text>
      </View>

      <View style={[styles.searchBox, { backgroundColor: t.colors.surface, borderColor: t.colors.border, borderRadius: t.radius.md, marginHorizontal: t.spacing(4), marginVertical: t.spacing(3) }]}>
        <Ionicons name="search" size={18} color={t.colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Поиск по ФИО"
          placeholderTextColor={t.colors.textMuted}
          style={{ flex: 1, color: t.colors.text, fontSize: t.fontSize.md, marginLeft: 8 }}
        />
        {query ? (
          <Ionicons name="close-circle" size={18} color={t.colors.textMuted} onPress={() => setQuery('')} />
        ) : null}
      </View>

      {ready && filtered.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title={query ? 'Никого не нашли' : 'Пациентов пока нет'}
          subtitle={query ? 'Попробуйте уточнить запрос' : 'Добавьте первого пациента, чтобы начать вести базу'}
          actionTitle={query ? undefined : 'Добавить пациента'}
          onAction={query ? undefined : goToAdd}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={p => p.id}
          contentContainerStyle={{ padding: t.spacing(4), paddingTop: 0, paddingBottom: 90 }}
          renderItem={({ item }) => (
            <PatientCard patient={item} onPress={() => navigation.navigate('PatientDetail', { patientId: item.id })} />
          )}
        />
      )}

      <View style={[styles.fab, { bottom: t.spacing(5) + 60, right: t.spacing(4) }]}>
        <AppButton title="Добавить" icon="add" onPress={goToAdd} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {},
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1,
  },
  fab: {
    position: 'absolute',
  },
});
