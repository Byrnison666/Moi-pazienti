import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { useData } from '../context/DataContext';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { getListBottomPadding } from '../navigation/tabBarMetrics';

export function PickPatientForAppointmentScreen() {
  const t = useTheme();
  const navigation = useNavigation<any>();
  const { data } = useData();
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...data.patients].sort((a, b) => a.fullName.localeCompare(b.fullName, 'ru'));
    if (!q) return list;
    return list.filter(p => p.fullName.toLowerCase().includes(q));
  }, [data.patients, query]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }} edges={['bottom']}>
      <ScreenHeader title="Выбор пациента" />
      <View style={{ padding: t.spacing(4) }}>
        <View style={[styles.searchBox, { backgroundColor: t.colors.surface, borderColor: t.colors.border, borderRadius: t.radius.md }]}>
          <Ionicons name="search" size={18} color={t.colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Найти пациента"
            placeholderTextColor={t.colors.textMuted}
            style={{ flex: 1, color: t.colors.text, fontSize: t.fontSize.md, marginLeft: 8 }}
          />
        </View>
      </View>
      {filtered.length === 0 ? (
        <EmptyState icon="people-outline" title="Никого не нашли" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={p => p.id}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: t.spacing(4), paddingBottom: getListBottomPadding(insets.bottom) }}
          renderItem={({ item }) => (
            <Card
              onPress={() => navigation.replace('AppointmentEdit', { patientId: item.id })}
              style={{ marginBottom: 10 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.avatar, { backgroundColor: t.colors.primarySoft }]}>
                  <Text style={{ color: t.colors.primary, fontWeight: '700' }}>
                    {item.fullName.split(/\s+/).slice(0, 2).map(s => s[0]?.toUpperCase()).join('')}
                  </Text>
                </View>
                <Text style={{ color: t.colors.text, fontSize: t.fontSize.md, fontWeight: '600', flex: 1 }} numberOfLines={1}>
                  {item.fullName}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={t.colors.textMuted} />
              </View>
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
});
