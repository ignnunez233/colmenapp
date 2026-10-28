// Equivalente a: auth/LoginScreen.kt
//
//> Nótese que no hay un "onLoginSuccess" explícito: igual que en el
//> original ("AuthStateListener actualizará el estado y AppNav
//> navegará"), acá basta con que login() tenga éxito — el listener
//> global (initAuthListener, en App.tsx) actualiza el store, y AppNav
//> reacciona solo porque lee ese mismo estado. La pantalla no navega
//> a mano tras un login exitoso.

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { colors, radii, spacing, minTouchTarget } from '../theme/tokens';

interface Props {
  onGoRegister: () => void;
}

export default function LoginScreen({ onGoRegister }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useAuthStore((s) => s.login);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      // Sin navegación manual acá: ver nota al inicio del archivo.
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al iniciar sesión';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.unknown}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor={colors.unknown}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={styles.primaryButtonText}>Entrar</Text>
        )}
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={onGoRegister}>
        <Text style={styles.secondaryButtonText}>Crear cuenta</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.screenPadding,
    backgroundColor: colors.surface,
    gap: spacing.gap,
  },
  title: { fontSize: 24, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: 12,
    fontSize: 15,
    color: colors.ink,
    minHeight: minTouchTarget,
  },
  error: { color: colors.dead, fontSize: 13 },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: { backgroundColor: colors.primaryHover },
  primaryButtonText: { color: colors.onPrimary, fontWeight: '700', fontSize: 15 },
  secondaryButton: {
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
});
