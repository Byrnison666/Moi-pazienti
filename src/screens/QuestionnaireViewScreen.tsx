import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { useData } from '../context/DataContext';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { QuestionnaireAnswerField } from '../components/QuestionnaireAnswerField';
import { formatDateLong } from '../utils/date';
import { PatientsStackParamList } from '../navigation/types';
import { getListBottomPadding } from '../navigation/tabBarMetrics';

type Props = NativeStackScreenProps<PatientsStackParamList, 'QuestionnaireView'>;

export function QuestionnaireViewScreen({ navigation, route }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { data } = useData();
  const patient = data.patients.find(p => p.id === route.params.patientId);
  const pq = patient?.questionnaires.find(q => q.id === route.params.pqId);
  if (!patient || !pq) return null;

  const sortedQ = [...pq.questionsSnapshot].sort((a, b) => a.order - b.order);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }} edges={['bottom']}>
      <ScreenHeader title="Просмотр анкеты" />
      <ScrollView contentContainerStyle={{ padding: t.spacing(4), paddingBottom: getListBottomPadding(insets.bottom) }}>
        <Card>
          <Text style={{ color: t.colors.text, fontSize: t.fontSize.xl, fontWeight: '700' }}>{pq.templateTitle}</Text>
          <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.sm, marginTop: 4 }}>
            Заполнено {formatDateLong(pq.completedAt)}
          </Text>
        </Card>

        <View style={{ marginTop: 16 }}>
          {sortedQ.map(q => (
            <QuestionnaireAnswerField
              key={q.id}
              question={q}
              answer={pq.answers.find(a => a.questionId === q.id)}
              onChange={() => {}}
              readOnly
            />
          ))}
        </View>

        <View style={{ marginTop: 12 }}>
          <AppButton
            title="Редактировать"
            icon="create-outline"
            fullWidth
            onPress={() => navigation.replace('QuestionnaireFill', { patientId: patient.id, pqId: pq.id })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
