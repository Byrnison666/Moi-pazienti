import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';
import {
  AddPatientStackParamList,
  NotesStackParamList,
  PatientsStackParamList,
  QuestionnairesStackParamList,
  RootTabParamList,
  ScheduleStackParamList,
  SettingsStackParamList,
} from './types';

import { PatientsScreen } from '../screens/PatientsScreen';
import { PatientDetailScreen } from '../screens/PatientDetailScreen';
import { EditPatientScreen } from '../screens/EditPatientScreen';
import { NoteEditScreen } from '../screens/NoteEditScreen';
import { AppointmentEditScreen } from '../screens/AppointmentEditScreen';
import { ScheduleScreen } from '../screens/ScheduleScreen';
import { PickPatientForAppointmentScreen } from '../screens/PickPatientForAppointmentScreen';
import { AddPatientScreen } from '../screens/AddPatientScreen';
import { QuestionnairesScreen } from '../screens/QuestionnairesScreen';
import { QuestionnaireEditorScreen } from '../screens/QuestionnaireEditorScreen';
import { QuestionnaireFillScreen } from '../screens/QuestionnaireFillScreen';
import { QuestionnaireViewScreen } from '../screens/QuestionnaireViewScreen';
import { NotesScreen } from '../screens/NotesScreen';
import { JournalEntryEditScreen } from '../screens/JournalEntryEditScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SyncSettingsScreen } from '../screens/SyncSettingsScreen';
import { SyncStatusOverlay } from '../components/SyncStatusOverlay';

const PatientsStack = createNativeStackNavigator<PatientsStackParamList>();
const ScheduleStack = createNativeStackNavigator<ScheduleStackParamList>();
const AddPatientStack = createNativeStackNavigator<AddPatientStackParamList>();
const QuestionnairesStack = createNativeStackNavigator<QuestionnairesStackParamList>();
const NotesStack = createNativeStackNavigator<NotesStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

// Общие опции стека. Native-header отключён — шапку рисует ScreenHeader
// внутри каждого экрана (native-header v6 не отступает под статус-бар в
// Android edge-to-edge SDK 54).
function useStackScreenOptions() {
  const t = useTheme();
  return {
    headerShown: false,
    contentStyle: { backgroundColor: t.colors.background },
  };
}

function PatientsStackNav() {
  return (
    <PatientsStack.Navigator screenOptions={useStackScreenOptions()}>
      <PatientsStack.Screen name="PatientsList" component={PatientsScreen} options={{ headerShown: false }} />
      <PatientsStack.Screen name="PatientDetail" component={PatientDetailScreen} options={{ title: 'Карточка пациента' }} />
      <PatientsStack.Screen name="EditPatient" component={EditPatientScreen} options={{ title: 'Редактирование' }} />
      <PatientsStack.Screen name="NoteEdit" component={NoteEditScreen} options={{ title: 'Заметка' }} />
      <PatientsStack.Screen name="AppointmentEdit" component={AppointmentEditScreen} options={{ title: 'Прием' }} />
      <PatientsStack.Screen name="QuestionnaireFill" component={QuestionnaireFillScreen} options={{ title: 'Анкета' }} />
      <PatientsStack.Screen name="QuestionnaireView" component={QuestionnaireViewScreen} options={{ title: 'Просмотр анкеты' }} />
    </PatientsStack.Navigator>
  );
}

function ScheduleStackNav() {
  return (
    <ScheduleStack.Navigator screenOptions={useStackScreenOptions()}>
      <ScheduleStack.Screen name="ScheduleList" component={ScheduleScreen} options={{ headerShown: false }} />
      <ScheduleStack.Screen name="PatientDetail" component={PatientDetailScreen as any} options={{ title: 'Карточка пациента' }} />
      <ScheduleStack.Screen name="AppointmentEdit" component={AppointmentEditScreen as any} options={{ title: 'Прием' }} />
      <ScheduleStack.Screen name="PickPatientForAppointment" component={PickPatientForAppointmentScreen} options={{ title: 'Выбор пациента' }} />
    </ScheduleStack.Navigator>
  );
}

function AddPatientStackNav() {
  return (
    <AddPatientStack.Navigator screenOptions={useStackScreenOptions()}>
      <AddPatientStack.Screen name="AddPatient" component={AddPatientScreen} options={{ headerShown: false }} />
      <AddPatientStack.Screen name="PatientDetail" component={PatientDetailScreen as any} options={{ title: 'Карточка пациента' }} />
    </AddPatientStack.Navigator>
  );
}

function QuestionnairesStackNav() {
  return (
    <QuestionnairesStack.Navigator screenOptions={useStackScreenOptions()}>
      <QuestionnairesStack.Screen name="QuestionnairesList" component={QuestionnairesScreen} options={{ headerShown: false }} />
      <QuestionnairesStack.Screen name="QuestionnaireEditor" component={QuestionnaireEditorScreen} options={{ title: 'Шаблон анкеты' }} />
    </QuestionnairesStack.Navigator>
  );
}

function NotesStackNav() {
  return (
    <NotesStack.Navigator screenOptions={useStackScreenOptions()}>
      <NotesStack.Screen name="NotesList" component={NotesScreen} options={{ headerShown: false }} />
      <NotesStack.Screen name="JournalEntryEdit" component={JournalEntryEditScreen} options={{ title: 'Запись' }} />
    </NotesStack.Navigator>
  );
}

function SettingsStackNav() {
  return (
    <SettingsStack.Navigator screenOptions={useStackScreenOptions()}>
      <SettingsStack.Screen name="SettingsHome" component={SettingsScreen} options={{ headerShown: false }} />
      <SettingsStack.Screen name="SyncSettings" component={SyncSettingsScreen} options={{ title: 'Синхронизация' }} />
    </SettingsStack.Navigator>
  );
}

export function AppNavigator() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const navTheme = t.mode === 'dark'
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: t.colors.background, card: t.colors.surface, primary: t.colors.primary, text: t.colors.text, border: t.colors.border } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: t.colors.background, card: t.colors.surface, primary: t.colors.primary, text: t.colors.text, border: t.colors.border } };

  return (
    <NavigationContainer theme={navTheme}>
      <SyncStatusOverlay />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: t.colors.primary,
          tabBarInactiveTintColor: t.colors.textMuted,
          tabBarStyle: {
            backgroundColor: t.colors.surface,
            borderTopColor: t.colors.border,
            height: 64 + insets.bottom,
            paddingBottom: 8 + insets.bottom,
            paddingTop: 6,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          tabBarIcon: ({ color, size }) => {
            const map: Record<string, keyof typeof Ionicons.glyphMap> = {
              PatientsTab: 'people-outline',
              ScheduleTab: 'calendar-outline',
              AddPatientTab: 'add-circle',
              NotesTab: 'book-outline',
              QuestionnairesTab: 'clipboard-outline',
              SettingsTab: 'settings-outline',
            };
            return <Ionicons name={map[route.name] ?? 'ellipse-outline'} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="PatientsTab" component={PatientsStackNav} options={{ tabBarLabel: 'Пациенты' }} />
        <Tab.Screen name="ScheduleTab" component={ScheduleStackNav} options={{ tabBarLabel: 'Расписание' }} />
        <Tab.Screen name="AddPatientTab" component={AddPatientStackNav} options={{ tabBarLabel: 'Добавить' }} />
        <Tab.Screen name="NotesTab" component={NotesStackNav} options={{ tabBarLabel: 'Заметки' }} />
        <Tab.Screen name="QuestionnairesTab" component={QuestionnairesStackNav} options={{ tabBarLabel: 'Анкеты' }} />
        <Tab.Screen name="SettingsTab" component={SettingsStackNav} options={{ tabBarLabel: 'Настройки' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
