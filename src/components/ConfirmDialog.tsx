import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { AppButton } from './AppButton';

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  confirmTitle?: string;
  cancelTitle?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible, title, message,
  confirmTitle = 'Удалить', cancelTitle = 'Отмена',
  destructive = true, onConfirm, onCancel,
}: Props) {
  const t = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={[styles.overlay, { backgroundColor: t.colors.overlay }]} onPress={onCancel}>
        <Pressable
          style={[styles.dialog, { backgroundColor: t.colors.surface, borderRadius: t.radius.lg, padding: t.spacing(5) }]}
          onPress={() => {}}
        >
          <Text style={{ color: t.colors.text, fontSize: t.fontSize.lg, fontWeight: '700', marginBottom: 8 }}>{title}</Text>
          {message ? (
            <Text style={{ color: t.colors.textMuted, fontSize: t.fontSize.md, lineHeight: 22, marginBottom: 18 }}>{message}</Text>
          ) : null}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <AppButton title={cancelTitle} variant="ghost" onPress={onCancel} fullWidth />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <AppButton title={confirmTitle} variant={destructive ? 'danger' : 'primary'} onPress={onConfirm} fullWidth />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  dialog: { width: '100%', maxWidth: 420 },
  row: { flexDirection: 'row' },
});
