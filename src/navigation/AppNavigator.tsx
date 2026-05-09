import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import {
  AddPatientStackParamList,
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
import { SettingsScreen } from '../screens/SettingsScreen';

const PatientsStack = createNativeStackNavigator<PatientsStackParamList>();
const ScheduleStack = createNativeStackNavigator<ScheduleStackParamList>();
const AddPatientStack = createNativeStackNavigator<AddPatientStackParamList>();
const QuestionnairesStack = createNativeStackNavigator<QuestionnairesStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

function PatientsStackNav() {
  const t = useTheme();
  return (
    <PatientsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: t.colors.background },
        headerTintColor: t.colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: t.colors.background },
      }}
    >
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
  const t = useTheme();
  return (
    <ScheduleStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: t.colors.background },
        headerTintColor: t.colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: t.colors.background },
      }}
    >
      <ScheduleStack.Screen name="ScheduleList" component={ScheduleScreen} options={{ headerShown: false }} />
      <ScheduleStack.Screen name="PatientDetail" component={PatientDetailScreen as any} options={{ title: 'Карточка пациента' }} />
      <ScheduleStack.Screen name="AppointmentEdit" component={AppointmentEditScreen as any} options={{ title: 'Прием' }} />
      <ScheduleStack.Screen name="PickPatientForAppointment" component={PickPatientForAppointmentScreen} options={{ title: 'Выбор пациента' }} />
    </ScheduleStack.Navigator>
  );
}

function AddPatientStackNav() {
  const t = useTheme();
  return (
    <AddPatientStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: t.colors.background },
        headerTintColor: t.colors.text,
        contentStyle: { backgroundColor: t.colors.background },
      }}
    >
      <AddPatientStack.Screen name="AddPatient" component={AddPatientScreen} options={{ headerShown: false }} />
      <AddPatientStack.Screen name="PatientDetail" component={PatientDetailScreen as any} options={{ title: 'Карточка пациента' }} />
    </AddPatientStack.Navigator>
  );
}

function QuestionnairesStackNav() {
  const t = useTheme();
  return (
    <QuestionnairesStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: t.colors.background },
        headerTintColor: t.colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: t.colors.background },
      }}
    >
      <QuestionnairesStack.Screen name="QuestionnairesList" component={QuestionnairesScreen} options={{ headerShown: false }} />
      <QuestionnairesStack.Screen name="QuestionnaireEditor" component={QuestionnaireEditorScreen} options={{ title: 'Шаблон анкеты' }} />
    </QuestionnairesStack.Navigator>
  );
}

function SettingsStackNav() {
  const t = useTheme();
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: t.colors.background },
        headerTintColor: t.colors.text,
        contentStyle: { backgroundColor: t.colors.background },
      }}
    >
      <SettingsStack.Screen name="SettingsHome" component={SettingsScreen} options={{ headerShown: false }} />
    </SettingsStack.Navigator>
  );
}

export function AppNavigator() {
  const t = useTheme();
  const navTheme = t.mode === 'dark'
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: t.colors.background, card: t.colors.surface, primary: t.colors.primary, text: t.colors.text, border: t.colors.border } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: t.colors.background, card: t.colors.surface, primary: t.colors.primary, text: t.colors.text, border: t.colors.border } };

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: t.colors.primary,
          tabBarInactiveTintColor: t.colors.textMuted,
          tabBarStyle: {
            backgroundColor: t.colors.surface,
            borderTopColor: t.colors.border,
            height: 64,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          tabBarIcon: ({ color, size }) => {
            const map: Record<string, keyof typeof Ionicons.glyphMap> = {
              PatientsTab: 'people-outline',
              ScheduleTab: 'calendar-outline',
              AddPatientTab: 'add-circle',
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
        <Tab.Screen name="QuestionnairesTab" component={QuestionnairesStackNav} options={{ tabBarLabel: 'Анкеты' }} />
        <Tab.Screen name="SettingsTab" component={SettingsStackNav} options={{ tabBarLabel: 'Настройки' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
