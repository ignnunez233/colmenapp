// Equivalente a: home/HiveDetailScreen.kt + AudioNoteComposer.kt
//
//> CAMBIO CLAVE de esta pantalla respecto a la versión anterior: antes
//> recibía "hiveId" como prop, pasado a mano por AppNav.tsx desde
//> route.params.id. Con Expo Router, esta pantalla vive en el archivo
//> app/hive/[id].tsx — los corchetes en el NOMBRE DEL ARCHIVO son los
//> que declaran el parámetro dinámico. Para leer su valor actual se
//> usa el hook useLocalSearchParams(), en vez de recibirlo por props.
//>
//> Es el mismo concepto que composable("hive/{id}") en Kotlin, donde
//> "{id}" en la ruta se leía con backStackEntry.arguments?.getString("id")
//> — acá el "{id}" son los corchetes en el nombre del archivo, y
//> useLocalSearchParams() cumple el rol de ese "arguments?.getString(...)".
//
// TODO: subir el archivo local (uri) a Storage al guardar la nota de
// audio (pendiente porque esta entrega excluye Firebase/Storage).

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, radii, spacing, minTouchTarget } from '../../theme/tokens';
import QueenStateBadge from '../../components/QueenStateBadge';
import ReminderCard from '../../reminders/ReminderCard';
import { useHiveAudioRecorder } from '../../audio/useHiveAudioRecorder';
import { useHiveStore } from '../../store/hiveStore';

const RECORD_LIMIT_SEC = 10;

export default function HiveDetailScreen() {
  const router = useRouter();

  //> Equivalente a leer route.params.id. useLocalSearchParams() siempre
  //> devuelve strings (o string[] si el mismo parámetro se repite en la
  //> URL), por eso no hace falta tipar nada especial acá: "id" ya
  //> calza con el "hiveId: string" que usaba el resto del código.
  const { id: hiveId } = useLocalSearchParams<{ id: string }>();

  const hive = useHiveStore((s) => s.hive);
  const notes = useHiveStore((s) => s.notes);
  const observeHive = useHiveStore((s) => s.observeHive);
  const observeNotes = useHiveStore((s) => s.observeNotes);
  const addNoteToStore = useHiveStore((s) => s.addNote);
  const addAudioNoteToStore = useHiveStore((s) => s.addAudioNote);

  const [draftText, setDraftText] = useState('');
  const [recordedSec, setRecordedSec] = useState(0);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const confirmationOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!hiveId) return;
    observeHive(hiveId);
    const unsubscribe = observeNotes(hiveId);
    return () => unsubscribe();
  }, [hiveId, observeHive, observeNotes]);

  const { status, startRecording, stopRecording, reset } = useHiveAudioRecorder();
  const isRecording = status === 'recording';

  function showConfirmation(message: string) {
    setConfirmation(message);
    Animated.sequence([
      Animated.timing(confirmationOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(confirmationOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => setConfirmation(null));
  }

  async function handleStartRecording() {
    setRecordedSec(0);
    const started = await startRecording();
    if (!started) {
      showConfirmation('Permiso de micrófono denegado');
      return;
    }
    timerRef.current = setInterval(() => {
      setRecordedSec((prev) => {
        const next = prev + 1;
        if (next >= RECORD_LIMIT_SEC) handleStopRecording();
        return next;
      });
    }, 1000);
  }

  async function handleStopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    const result = await stopRecording();
    reset();
    if (!result || !hiveId) {
      showConfirmation('No se obtuvo audio');
      return;
    }
    try {
      // TODO: subir result.uri a Storage y usar esa URL en vez del uri local.
      await addAudioNoteToStore(hiveId, '', result.uri, result.durationSec);
      showConfirmation(`Nota de audio guardada (${result.durationSec}s)`);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al guardar el audio';
      showConfirmation(message);
    }
  }

  async function addTextNote() {
    const text = draftText.trim();
    if (!text || !hiveId) return;
    try {
      await addNoteToStore(hiveId, text);
      setDraftText('');
      showConfirmation('Nota guardada');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al guardar la nota';
      showConfirmation(message);
    }
  }

  if (!hive) {
    return (
      <View style={styles.screen}>
        <Text style={styles.emptyText}>Cargando colmena…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        {/* router.back() reemplaza el onBack() que antes llegaba por props */}
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
          <Text style={styles.backText}>‹ Volver</Text>
        </Pressable>
        <Text style={styles.hiveName}>{hive.name}</Text>
        <Text style={styles.hiveCode}>{hive.code}</Text>
        <QueenStateBadge state={hive.queenState} />
      </View>

      <ReminderCard hiveName={hive.name} onScheduled={showConfirmation} />

      <View style={styles.composer}>
        <TextInput
          style={styles.textInput}
          placeholder="Escribe una nota sobre esta colmena"
          placeholderTextColor={colors.unknown}
          value={draftText}
          onChangeText={setDraftText}
          multiline
        />
        <View style={styles.composerActions}>
          <Pressable
            style={[styles.recordButton, isRecording && styles.recordButtonActive]}
            onPress={() => (isRecording ? handleStopRecording() : handleStartRecording())}
          >
            <Text style={styles.recordButtonText}>
              {isRecording ? `Grabando… ${recordedSec}s` : '🎙 Grabar nota (máx. 10s)'}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.saveButton, !draftText.trim() && styles.saveButtonDisabled]}
            onPress={addTextNote}
            disabled={!draftText.trim()}
          >
            <Text style={styles.saveButtonText}>Guardar</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        style={styles.list}
        data={notes}
        keyExtractor={(item) => item.id ?? String(item.createdAt)}
        renderItem={({ item }) => (
          <View style={styles.noteCard}>
            {item.text ? <Text style={styles.noteText}>{item.text}</Text> : null}
            {item.audioUrl ? (
              <View style={styles.audioRow}>
                <Text style={styles.audioIcon}>▶</Text>
                <Text style={styles.audioLabel}>Nota de audio · {item.audioDurationSec}s</Text>
              </View>
            ) : null}
            <Text style={styles.noteDate}>{item.createdAt.toLocaleDateString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Todavía no hay notas para esta colmena.</Text>}
      />

      {confirmation && (
        <Animated.View style={[styles.snackbar, { opacity: confirmationOpacity }]}>
          <Text style={styles.snackbarText}>{confirmation}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { paddingTop: 12, paddingHorizontal: spacing.screenPadding, paddingBottom: spacing.gap, gap: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  backButton: { minHeight: minTouchTarget, justifyContent: 'center' },
  backText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  hiveName: { fontSize: 24, fontWeight: '700', color: colors.ink },
  hiveCode: { fontSize: 14, color: colors.unknown, marginBottom: 4 },
  composer: { marginTop: spacing.gap, marginHorizontal: spacing.screenPadding, backgroundColor: colors.surfaceMuted, borderRadius: radii.lg, padding: spacing.cardPadding, gap: spacing.gap },
  textInput: { minHeight: 56, fontSize: 15, color: colors.ink, textAlignVertical: 'top' },
  composerActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.gap },
  recordButton: { flex: 1, minHeight: minTouchTarget, borderRadius: radii.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  recordButtonActive: { backgroundColor: colors.dead, borderColor: colors.dead },
  recordButtonText: { color: colors.ink, fontWeight: '600', fontSize: 13 },
  saveButton: { minHeight: minTouchTarget, paddingHorizontal: 20, borderRadius: radii.sm, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  saveButtonDisabled: { backgroundColor: colors.primaryHover },
  saveButtonText: { color: colors.onPrimary, fontWeight: '700', fontSize: 14 },
  list: { flex: 1, marginTop: spacing.gap },
  noteCard: { marginHorizontal: spacing.screenPadding, marginBottom: spacing.gap, backgroundColor: colors.surfaceMuted, borderRadius: radii.lg, padding: spacing.cardPadding, gap: 6 },
  noteText: { color: colors.ink, fontSize: 15 },
  audioRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  audioIcon: { color: colors.primary, fontSize: 16 },
  audioLabel: { color: colors.ink, fontSize: 14, fontWeight: '500' },
  noteDate: { color: colors.unknown, fontSize: 12 },
  emptyText: { textAlign: 'center', color: colors.unknown, marginTop: 32, paddingHorizontal: spacing.screenPadding },
  snackbar: { position: 'absolute', left: spacing.screenPadding, right: spacing.screenPadding, bottom: 24, backgroundColor: colors.ink, borderRadius: radii.sm, paddingVertical: 12, paddingHorizontal: 16 },
  snackbarText: { color: colors.surface, fontSize: 14, textAlign: 'center' },
});
