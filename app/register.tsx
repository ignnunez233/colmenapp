// Equivalente a: auth/RegisterScreen.kt
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { colors, radii, spacing, minTouchTarget } from '../theme/tokens';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useAuthStore((s) => s.register);

  const handleRegister = async () => {
    setError(null);
    setLoading(true);
    try {
      await register(email, password);
      // Mismo patrón que LoginScreen: volver a "/" deja que
      // app/index.tsx redirija a /home una vez que el listener global
      // haya actualizado el estado de auth.
      router.replace('/');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al registrar';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear cuenta</Text>

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
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.primaryButtonText}>Registrarme</Text>}
      </Pressable>

      {/* router.back() vuelve a la pantalla anterior en el historial
          (equivalente a navigation.goBack() de React Navigation) */}
      <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
        <Text style={styles.secondaryButtonText}>Volver</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing.screenPadding, backgroundColor: colors.surface, gap: spacing.gap },
  title: { fontSize: 24, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, padding: 12, fontSize: 15, color: colors.ink, minHeight: minTouchTarget },
  error: { color: colors.dead, fontSize: 13 },
  primaryButton: { backgroundColor: colors.primary, borderRadius: radii.sm, minHeight: minTouchTarget, alignItems: 'center', justifyContent: 'center' },
  primaryButtonDisabled: { backgroundColor: colors.primaryHover },
  primaryButtonText: { color: colors.onPrimary, fontWeight: '700', fontSize: 15 },
  secondaryButton: { minHeight: minTouchTarget, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
});
