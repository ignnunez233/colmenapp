// Equivalente a: profile/ProfileScreen.kt

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { colors, radii, spacing, minTouchTarget } from '../theme/tokens';

interface Props {
  onBack: () => void;
}

export default function ProfileScreen({ onBack }: Props) {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const authState = useAuthStore((s) => s.state);
  const logout = useAuthStore((s) => s.logout);
  const changePassword = useAuthStore((s) => s.changePassword);

  const handleLogout = () => {
    //> logout() no es async en el store (auth().signOut() es
    //> sincrónico del lado del cliente); no hace falta await ni
    //> try/catch acá, igual que en el AuthViewModel original.
    logout();
    // Sin navegación manual: el listener global cambia el estado a
    // "unauthenticated" y AppNav vuelve solo a Welcome/Login.
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim()) return;
    setMessage(null);
    setLoading(true);
    try {
      await changePassword(newPassword);
      setMessage('Contraseña actualizada');
      setNewPassword('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al cambiar la contraseña';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>

      {authState.status === 'authenticated' && (
        <Text style={styles.uid}>UID: {authState.uid}</Text>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Cambiar contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Nueva contraseña"
          placeholderTextColor={colors.unknown}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        {message && <Text style={styles.message}>{message}</Text>}
        <Pressable
          style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.primaryButtonText}>Actualizar</Text>
          )}
        </Pressable>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={onBack}>
        <Text style={styles.secondaryButtonText}>Volver</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.screenPadding,
    backgroundColor: colors.surface,
    gap: spacing.gap,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.ink },
  uid: { fontSize: 12, color: colors.unknown },
  section: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.lg,
    padding: spacing.cardPadding,
    gap: spacing.gap,
    marginTop: spacing.gap,
  },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: colors.ink },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: 12,
    fontSize: 15,
    color: colors.ink,
    minHeight: minTouchTarget,
    backgroundColor: colors.surface,
  },
  message: { fontSize: 13, color: colors.ink },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: { backgroundColor: colors.primaryHover },
  primaryButtonText: { color: colors.onPrimary, fontWeight: '700', fontSize: 14 },
  logoutButton: {
    borderWidth: 1,
    borderColor: colors.dead,
    borderRadius: radii.sm,
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.gap,
  },
  logoutButtonText: { color: colors.dead, fontWeight: '700', fontSize: 14 },
  secondaryButton: {
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
});
