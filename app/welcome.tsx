// Sin equivalente Kotlin directo (ver nota en la versión anterior del
// starter): sirve como punto de entrada visual y hub de navegación.
//
//> CAMBIO CLAVE respecto a la versión anterior: esta pantalla ya NO
//> recibe "onGoLogin"/"onGoRegister" como props desde un AppNav padre.
//> En Expo Router, cualquier pantalla obtiene su propia capacidad de
//> navegar llamando al hook useRouter() y usando router.push('/ruta').
//> La ruta es literalmente el nombre del archivo dentro de app/.

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, minTouchTarget } from '../theme/tokens';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <View style={styles.brandBlock}>
        {/* TODO: reemplazar por el logo real de la app (ic_logo) */}
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🐝</Text>
        </View>
        <Text style={styles.appName}>ColmenasApp</Text>
        <Text style={styles.tagline}>
          Notas, recordatorios y seguimiento de tus colmenas
        </Text>
      </View>

      <View style={styles.actions}>
        {/* router.push('/login') navega al archivo app/login.tsx */}
        <Pressable style={styles.primaryButton} onPress={() => router.push('/login')}>
          <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => router.push('/register')}>
          <Text style={styles.secondaryButtonText}>Crear cuenta</Text>
        </Pressable>
      </View>

      {/* Acceso rápido de desarrollo — quitar cuando Auth esté probado
          de punta a punta (mismo aviso que en la versión anterior). */}
      <View style={styles.devBlock}>
        <Text style={styles.devLabel}>Acceso rápido (solo desarrollo)</Text>
        <Pressable style={styles.devButton} onPress={() => router.push('/home')}>
          <Text style={styles.devButtonText}>Ir directo a Mis colmenas →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.screenPadding,
    justifyContent: 'space-between',
    paddingVertical: 48,
  },
  brandBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  logoCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  logoEmoji: { fontSize: 44 },
  appName: { fontSize: 26, fontWeight: '700', color: colors.ink },
  tagline: { fontSize: 14, color: colors.unknown, textAlign: 'center', paddingHorizontal: 24 },
  actions: { gap: spacing.gap },
  primaryButton: {
    backgroundColor: colors.primary, borderRadius: radii.sm, minHeight: minTouchTarget,
    alignItems: 'center', justifyContent: 'center',
  },
  primaryButtonText: { color: colors.onPrimary, fontWeight: '700', fontSize: 15 },
  secondaryButton: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary,
    borderRadius: radii.sm, minHeight: minTouchTarget, alignItems: 'center', justifyContent: 'center',
  },
  secondaryButtonText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  devBlock: {
    marginTop: spacing.gap, borderTopWidth: 1, borderTopColor: colors.border,
    paddingTop: spacing.gap, alignItems: 'center', gap: 8,
  },
  devLabel: { fontSize: 11, color: colors.unknown, textTransform: 'uppercase' },
  devButton: { minHeight: minTouchTarget, justifyContent: 'center' },
  devButtonText: { color: colors.primary, fontWeight: '600', fontSize: 13 },
});
