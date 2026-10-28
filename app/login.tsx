// Equivalente a: auth/LoginScreen.kt
//
//> Nótese que tras un login exitoso NO se llama a router.push a mano.
//> El listener global (initAuthListener, registrado en app/_layout.tsx)
//> actualiza authStore.state, y app/index.tsx reacciona solo mandando
//> a /home vía <Redirect> — pero como esta pantalla vive en /login,
//> no en /, hace falta un paso extra: volver a la raíz para que ese
//> <Redirect> se evalúe. Ver el comentario junto a router.replace abajo.

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { colors, radii, spacing, minTouchTarget } from '../theme/tokens';

export default function LoginScreen() {
  const router = useRouter();
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
      //> router.replace('/') (en vez de push) vuelve a la ruta raíz
      //> SIN dejar /login en el historial de navegación — así, si el
      //> usuario presiona "atrás" después de loguearse, no vuelve a la
      //> pantalla de login. Al llegar a "/", app/index.tsx ya lee
      //> authState.status === 'authenticated' (gracias al listener que
      //> ya corrió) y hace <Redirect href="/home"/> de inmediato.
      router.replace('/');
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
        {loading ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.primaryButtonText}>Entrar</Text>}
      </Pressable>

      {/* router.push('/register') navega al archivo app/register.tsx */}
      <Pressable style={styles.secondaryButton} onPress={() => router.push('/register')}>
        <Text style={styles.secondaryButtonText}>Crear cuenta</Text>
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
