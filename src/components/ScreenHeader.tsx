import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

interface Props {
  title: string;
  /** По умолчанию — navigation.goBack(). Передать null, чтобы скрыть кнопку назад. */
  onBack?: (() => void) | null;
  /** Контент справа (например кнопка «Сохранить»). */
  right?: React.ReactNode;
}

// Собственная шапка экрана. Native-stack header в RN Navigation v6 не отступает
// под статус-бар в Android edge-to-edge (SDK 54), поэтому рисуем заголовок сами
// поверх SafeAreaView(top).
export function ScreenHeader({ title, onBack, right }: Props) {
  const t = useTheme();
  const nav = useNavigation<any>();
  const showBack = onBack !== null;
  const handleBack = onBack ?? (() => nav.goBack());

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: t.colors.background }}>
      <View style={[styles.row, { borderBottomColor: t.colors.border }]}>
        {showBack ? (
          <Pressable onPress={handleBack} hitSlop={12} style={styles.side}>
            <Ionicons name="chevron-back" size={26} color={t.colors.text} />
          </Pressable>
        ) : (
          <View style={styles.side} />
        )}
        <Text numberOfLines={1} style={[styles.title, { color: t.colors.text }]}>
          {title}
        </Text>
        <View style={[styles.side, styles.right]}>{right}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  side: { width: 44, justifyContent: 'center' },
  right: { alignItems: 'flex-end' },
  title: { flex: 1, fontSize: 18, fontWeight: '700' },
});
