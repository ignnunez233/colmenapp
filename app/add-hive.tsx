// Equivalente a: home/AddHiveScreen.kt
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useHiveStore } from '../store/hiveStore';
import { useAuthStore } from '../store/authStore';
import { colors, radii, spacing, minTouchTarget } from '../theme/tokens';

export default function AddHiveScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useHiveStore((s) => s.create);
  const authState = useAuthStore((s) => s.state);

  const handleSave = async () => {
    if (authState.status !== 'authenticated') {
      setError('Debes iniciar sesión');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await create({ uid: authState.uid, name, code, date: new Date(), type });
      // router.back() vuelve a /home, que fue la pantalla que llamó
      // a router.push('/add-hive') originalmente.
      router.back();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al guardar';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nueva colmena</Text>

      <TextInput style={styles.input} placeholder="Nombre" placeholderTextColor={colors.unknown} value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Código (solo letras y números)" placeholderTextColor={colors.unknown} value={code} onChangeText={setCode} autoCapitalize="characters" />
      <TextInput style={styles.input} placeholder="Tipo (ej. Langstroth)" placeholderTextColor={colors.unknown} value={type} onChangeText={setType} />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.saveButtonText}>Guardar</Text>}
      </Pressable>
      <Pressable style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.screenPadding, backgroundColor: colors.surface, gap: spacing.gap },
  title: { fontSize: 22, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, padding: 12, fontSize: 15, color: colors.ink, minHeight: minTouchTarget },
  error: { color: colors.dead, fontSize: 13 },
  saveButton: { backgroundColor: colors.primary, borderRadius: radii.sm, minHeight: minTouchTarget, alignItems: 'center', justifyContent: 'center' },
  saveButtonDisabled: { backgroundColor: colors.primaryHover },
  saveButtonText: { color: colors.onPrimary, fontWeight: '700', fontSize: 15 },
  cancelButton: { minHeight: minTouchTarget, alignItems: 'center', justifyContent: 'center' },
  cancelButtonText: { color: colors.unknown, fontWeight: '600' },
});
