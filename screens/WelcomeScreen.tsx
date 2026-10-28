// Pantalla de bienvenida / menú inicial.
//
//> NOTA: esto no traduce ningún archivo Kotlin puntual — el proyecto
//> original no tenía una pantalla de bienvenida propia, iba directo a
//> LoginScreen (ver MainActivity.kt: setContent { AppNav() }).
//> Se agrega acá como punto de entrada visual y como "hub" de
//> navegación mientras se sigue desarrollando el resto de la app, para
//> poder llegar a cualquier pantalla ya construida sin depender del
//> flujo de autenticación real.
//
// Sigue los lineamientos del informe (naranjo-blanco): logo/marca
// centrada, botones primarios naranjo con texto blanco, radios 12-16,
// targets táctiles >=44dp.

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radii, spacing, minTouchTarget } from '../theme/tokens';

interface Props {
  onGoLogin: () => void;
  onGoRegister: () => void;
  //> Accesos directos SOLO para desarrollo: permiten llegar a pantallas
  //> internas sin pasar por login real mientras Auth no está conectado
  //> del todo. Fáciles de quitar después: basta con no renderizar este
  //> bloque (ver comentario junto a devShortcuts más abajo).
  onGoHome?: () => void;
}

export default function WelcomeScreen({ onGoLogin, onGoRegister, onGoHome }: Props) {
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
        <Pressable style={styles.primaryButton} onPress={onGoLogin}>
          <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={onGoRegister}>
          <Text style={styles.secondaryButtonText}>Crear cuenta</Text>
        </Pressable>
      </View>

      {/* Accesos rápidos de desarrollo — quitar este bloque cuando el
          flujo de autenticación esté terminado y probado. */}
      {onGoHome && (
        <View style={styles.devBlock}>
          <Text style={styles.devLabel}>Acceso rápido (solo desarrollo)</Text>
          <Pressable style={styles.devButton} onPress={onGoHome}>
            <Text style={styles.devButtonText}>Ir directo a Mis colmenas →</Text>
          </Pressable>
        </View>
      )}
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
  brandBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoEmoji: { fontSize: 44 },
  appName: { fontSize: 26, fontWeight: '700', color: colors.ink },
  tagline: {
    fontSize: 14,
    color: colors.unknown,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  actions: { gap: spacing.gap },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: colors.onPrimary, fontWeight: '700', fontSize: 15 },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.sm,
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: { color: colors.primary, fontWeight: '700', fontSize: 15 },

  devBlock: {
    marginTop: spacing.gap,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.gap,
    alignItems: 'center',
    gap: 8,
  },
  devLabel: { fontSize: 11, color: colors.unknown, textTransform: 'uppercase' },
  devButton: { minHeight: minTouchTarget, justifyContent: 'center' },
  devButtonText: { color: colors.primary, fontWeight: '600', fontSize: 13 },
});
