import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import { TAB_BAR_BASE_HEIGHT, TAB_BAR_SIDE_MARGIN, TAB_BAR_BOTTOM_MARGIN } from './tabBarMetrics';

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  PatientsTab: 'people-outline',
  ScheduleTab: 'calendar-outline',
  NotesTab: 'book-outline',
  QuestionnairesTab: 'clipboard-outline',
};

const ICONS_ACTIVE: Record<string, keyof typeof Ionicons.glyphMap> = {
  PatientsTab: 'people',
  ScheduleTab: 'calendar',
  NotesTab: 'book',
  QuestionnairesTab: 'clipboard',
};

const LABELS: Record<string, string> = {
  PatientsTab: 'Пациенты',
  ScheduleTab: 'Расписание',
  NotesTab: 'Заметки',
  QuestionnairesTab: 'Анкеты',
};

export function CustomTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const t = useTheme();
  const lastNonAddTab = useRef<string>('PatientsTab');
  const currentRouteName = state.routes[state.index].name;
  if (currentRouteName !== 'AddPatientTab') {
    lastNonAddTab.current = currentRouteName;
  }

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: t.colors.surface,
          borderColor: t.colors.border,
          borderRadius: t.radius.xl,
          bottom: TAB_BAR_BOTTOM_MARGIN + insets.bottom,
          left: TAB_BAR_SIDE_MARGIN,
          right: TAB_BAR_SIDE_MARGIN,
          height: TAB_BAR_BASE_HEIGHT,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (event.defaultPrevented) return;
          if (isFocused && route.name === 'AddPatientTab') {
            navigation.navigate(lastNonAddTab.current);
          } else if (!isFocused) {
            navigation.navigate(route.name);
          }
        };

        if (route.name === 'AddPatientTab') {
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={({ pressed }) => [
                styles.fab,
                {
                  backgroundColor: t.colors.primary,
                  transform: [
                    { rotate: isFocused ? '45deg' : '0deg' },
                    { scale: pressed ? 0.9 : 1 },
                  ],
                },
              ]}
            >
              <Ionicons name="add" size={30} color={t.colors.textInverse} />
            </Pressable>
          );
        }

        const color = isFocused ? t.colors.accentStrong : t.colors.textMuted;
        const label = descriptors[route.key]?.options.tabBarLabel as string | undefined;

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.navItem}>
            <Ionicons
              name={(isFocused ? ICONS_ACTIVE[route.name] : ICONS[route.name]) ?? 'ellipse-outline'}
              size={isFocused ? 27 : 23}
              color={color}
              style={{ transform: [{ translateY: isFocused ? -3 : 0 }] }}
            />
            <Text style={{ fontSize: 10, fontFamily: t.font.bold, color, marginTop: 3, opacity: isFocused ? 1 : 0.75 }}>
              {label ?? LABELS[route.name] ?? route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fab: {
    width: 60, height: 60, borderRadius: 22, marginTop: -26,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 14, shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});
