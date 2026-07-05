import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { SyncState, subscribeSync } from '../sync/syncManager';

// Глобальный индикатор поверх навигации: виден только во время синхронизации.
export function SyncStatusOverlay() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [sync, setSync] = useState<SyncState>({ status: 'unconfigured' });
  useEffect(() => subscribeSync(setSync), []);

  if (sync.status !== 'syncing') return null;

  return (
    <View pointerEvents="none" style={[styles.wrap, { top: insets.top + 8 }]}>
      <View
        style={[
          styles.pill,
          {
            backgroundColor: t.colors.surface,
            borderColor: t.colors.border,
            borderRadius: t.radius.xl,
          },
        ]}
      >
        <ActivityIndicator size="small" color={t.colors.primary} />
        <Text style={{ color: t.colors.text, fontSize: t.fontSize.sm, fontWeight: '600' }}>
          Синхронизация…
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});
