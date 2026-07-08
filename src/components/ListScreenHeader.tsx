import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface Action {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: Action[];
}

// Заголовок корневого экрана таб-бара (Пациенты/Расписание/Заметки/Анкеты):
// эйябро + крупный тайтл + подзаголовок + иконки-действия справа.
export function ListScreenHeader({ eyebrow, title, subtitle, actions }: Props) {
  const t = useTheme();
  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: t.colors.background }}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          {eyebrow ? (
            <Text style={[styles.eyebrow, { color: t.colors.textMuted, fontFamily: t.font.extrabold }]}>
              {eyebrow}
            </Text>
          ) : null}
          <Text style={[styles.title, { color: t.colors.text, fontFamily: t.font.extrabold }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: t.colors.textMuted, fontFamily: t.font.medium }]}>{subtitle}</Text>
          ) : null}
        </View>
        {actions && actions.length > 0 ? (
          <View style={styles.actions}>
            {actions.map((a, i) => (
              <Pressable
                key={i}
                onPress={a.onPress}
                style={({ pressed }) => [
                  styles.iconBtn,
                  {
                    backgroundColor: t.colors.surface,
                    borderColor: t.colors.border,
                    borderRadius: t.radius.md,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Ionicons name={a.icon} size={19} color={t.colors.text} />
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  eyebrow: { fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },
  title: { fontSize: 26, letterSpacing: -0.4 },
  subtitle: { fontSize: 13, marginTop: 3 },
  actions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 42, height: 42, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
});
