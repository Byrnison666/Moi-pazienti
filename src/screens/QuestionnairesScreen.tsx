import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { QuestionnaireTemplateCard } from '../components/QuestionnaireTemplateCard';
import { EmptyState } from '../components/EmptyState';
import { AppButton } from '../components/AppButton';
import { ListScreenHeader } from '../components/ListScreenHeader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { QuestionnairesStackParamList } from '../navigation/types';
import { getFloatingActionBottom, getFabListBottomPadding } from '../navigation/tabBarMetrics';

type Props = NativeStackScreenProps<QuestionnairesStackParamList, 'QuestionnairesList'>;

export function QuestionnairesScreen({ navigation }: Props) {
  const t = useTheme();
  const { data, deleteTemplate } = useData();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }} edges={['top']}>
      <ListScreenHeader title="Анкеты" subtitle="Создавайте свои шаблоны и заполняйте их для пациентов" />

      {data.templates.length === 0 ? (
        <EmptyState
          icon="clipboard-outline"
          title="Шаблонов пока нет"
          subtitle="Создайте свою анкету: добавьте вопросы любого типа и используйте её для пациентов."
          actionTitle="Создать шаблон"
          onAction={() => navigation.navigate('QuestionnaireEditor', {})}
        />
      ) : (
        <FlatList
          data={data.templates}
          keyExtractor={tpl => tpl.id}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: t.spacing(4),
            paddingTop: t.spacing(4),
            paddingBottom: getFabListBottomPadding(insets.bottom),
          }}
          renderItem={({ item }) => (
            <QuestionnaireTemplateCard
              template={item}
              onPress={() => navigation.navigate('QuestionnaireEditor', { templateId: item.id })}
              onEdit={() => navigation.navigate('QuestionnaireEditor', { templateId: item.id })}
              onDelete={() => setConfirmId(item.id)}
            />
          )}
        />
      )}

      {data.templates.length > 0 ? (
        <View style={[styles.fab, { bottom: getFloatingActionBottom(insets.bottom), right: t.spacing(4) }]}>
          <AppButton title="Создать" icon="add" onPress={() => navigation.navigate('QuestionnaireEditor', {})} />
        </View>
      ) : null}

      <ConfirmDialog
        visible={!!confirmId}
        title="Удалить шаблон анкеты?"
        message="Уже заполненные у пациентов анкеты сохранятся как есть."
        onCancel={() => setConfirmId(null)}
        onConfirm={() => {
          if (confirmId) deleteTemplate(confirmId);
          setConfirmId(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fab: { position: 'absolute' },
});
