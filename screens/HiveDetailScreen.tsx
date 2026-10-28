// Equivalente a: home/HiveDetailScreen.kt + AudioNoteComposer.kt (fusionados)
//
// Sigue los lineamientos del "Informe Integral de Implementación —
// AuraBee" (naranjo-blanco): paleta en theme/tokens.ts, radios 12-16,
// padding de tarjetas 16-20, targets táctiles >=44dp, feedback inmediato
// vía confirmación visual (equivalente al Snackbar de Compose).
//
// TODO: subir el archivo local (uri) a Storage al guardar la nota de
// audio, igual que StorageRepository.uploadNoteAudio en el original
// (pendiente porque esta entrega excluye Firebase/Storage).
// Lectura/escritura de la colmena y sus notas ya están conectadas a
// Firestore vía store/hiveStore.ts (equivalente a HiveViewModel.kt).
// Recordatorios conectados vía reminders/ReminderCard.tsx
// (equivalente a ReminderCard.kt + ReminderScheduler.kt).

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors, radii, spacing, minTouchTarget } from '../theme/tokens';
import QueenStateBadge from '../components/QueenStateBadge';
import ReminderCard from '../reminders/ReminderCard';
import { useHiveAudioRecorder } from '../audio/useHiveAudioRecorder';
import { useHiveStore } from '../store/hiveStore';

interface Props {
  hiveId: string;
  onBack: () => void;
}

const RECORD_LIMIT_SEC = 10; // límite fijo del informe, sección 3.1

export default function HiveDetailScreen({ hiveId, onBack }: Props) {
  //> Se leen del store con selectores individuales (s => s.hive) en vez
  //> de desestructurar el store completo. Es la forma recomendada en
  //> Zustand: el componente solo se re-renderiza cuando ESE campo
  //> puntual cambia, no cada vez que cambia cualquier cosa del store
  //> (equivalente a observar un StateFlow específico, no todo el ViewModel).
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

  //> Carga puntual de la colmena (one-shot, igual que en el original)
  //> + suscripción en vivo a sus notas, con cleanup del listener.
  useEffect(() => {
    observeHive(hiveId);
    const unsubscribe = observeNotes(hiveId);
    return () => unsubscribe();
  }, [hiveId, observeHive, observeNotes]);

  //> Equivalente a "val recorder = remember { AudioRecorder(ctx) }".
  //> El hook ya trae adentro el estado (idle/recording/stopped) y las
  //> funciones para manejarlo — no hace falta un useState<boolean> aparte
  //> para "isRecording" como en la versión anterior de esta pantalla.
  const { status, startRecording, stopRecording, reset } = useHiveAudioRecorder();
  const isRecording = status === 'recording';

  function showConfirmation(message: string) {
    setConfirmation(message);
    Animated.sequence([
      Animated.timing(confirmationOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.delay(2200),
      Animated.timing(confirmationOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => setConfirmation(null));
  }

  //> Equivalente al botón "Grabar" del AudioNoteComposer.kt original:
  //> pide permiso (dentro del hook) e inicia. Si el permiso es denegado,
  //> se muestra la misma confirmación que mostraba el Snackbar de Kotlin.
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
        if (next >= RECORD_LIMIT_SEC) {
          handleStopRecording();
        }
        return next;
      });
    }, 1000);
  }

  //> Equivalente al botón "Detener" del original: detiene, obtiene
  //> uri + duración, y guarda la nota vía el store (que a su vez llama
  //> a hiveRepository.addNote → Firestore). Sigue pendiente subir el
  //> archivo a Storage antes de guardar la URL (ver TODO al inicio).
  async function handleStopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    const result = await stopRecording();
    reset();
    if (!result) {
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
    if (!text) return;
    try {
      await addNoteToStore(hiveId, text);
      setDraftText('');
      showConfirmation('Nota guardada');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al guardar la nota';
      showConfirmation(message);
    }
  }

  //> Ya no hace falta esta función local: ReminderCard llama
  //> directamente a reminderScheduler.ts (equivalente real a
  //> ReminderScheduler.kt) y solo reporta el resultado vía onScheduled,
  //> que reutiliza el mismo showConfirmation() de esta pantalla.

  if (!hive) {
    //> Equivalente al estado "hive == null" del original mientras carga
    //> (observeHive es asíncrono; en el primer render aún no ha llegado).
    return (
      <View style={styles.screen}>
        <Text style={styles.emptyText}>Cargando colmena…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Cabecera */}
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={8} style={styles.backButton}>
          <Text style={styles.backText}>‹ Volver</Text>
        </Pressable>
        <Text style={styles.hiveName}>{hive.name}</Text>
        <Text style={styles.hiveCode}>{hive.code}</Text>
        <QueenStateBadge state={hive.queenState} />
      </View>

      {/* Recordatorios */}
      <ReminderCard hiveName={hive.name} onScheduled={showConfirmation} />

      {/* Composer: texto + audio */}
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
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive,
            ]}
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

      {/* Listado de notas */}
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
                <Text style={styles.audioLabel}>
                  Nota de audio · {item.audioDurationSec}s
                </Text>
              </View>
            ) : null}
            <Text style={styles.noteDate}>
              {item.createdAt.toLocaleDateString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Todavía no hay notas para esta colmena.
          </Text>
        }
      />

      {/* Confirmación (equivalente al Snackbar de Compose) */}
      {confirmation && (
        <Animated.View
          style={[styles.snackbar, { opacity: confirmationOpacity }]}
        >
          <Text style={styles.snackbarText}>{confirmation}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

  header: {
    paddingTop: 12,
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.gap,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: { minHeight: minTouchTarget, justifyContent: 'center' },
  backText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  hiveName: { fontSize: 24, fontWeight: '700', color: colors.ink },
  hiveCode: { fontSize: 14, color: colors.unknown, marginBottom: 4 },

  composer: {
    marginTop: spacing.gap,
    marginHorizontal: spacing.screenPadding,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.lg,
    padding: spacing.cardPadding,
    gap: spacing.gap,
  },
  textInput: {
    minHeight: 56,
    fontSize: 15,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  composerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.gap,
  },
  recordButton: {
    flex: 1,
    minHeight: minTouchTarget,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonActive: {
    backgroundColor: colors.dead,
    borderColor: colors.dead,
  },
  recordButtonText: { color: colors.ink, fontWeight: '600', fontSize: 13 },
  saveButton: {
    minHeight: minTouchTarget,
    paddingHorizontal: 20,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: { backgroundColor: colors.primaryHover },
  saveButtonText: { color: colors.onPrimary, fontWeight: '700', fontSize: 14 },

  list: { flex: 1, marginTop: spacing.gap },
  noteCard: {
    marginHorizontal: spacing.screenPadding,
    marginBottom: spacing.gap,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.lg,
    padding: spacing.cardPadding,
    gap: 6,
  },
  noteText: { color: colors.ink, fontSize: 15 },
  audioRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  audioIcon: { color: colors.primary, fontSize: 16 },
  audioLabel: { color: colors.ink, fontSize: 14, fontWeight: '500' },
  noteDate: { color: colors.unknown, fontSize: 12 },
  emptyText: {
    textAlign: 'center',
    color: colors.unknown,
    marginTop: 32,
    paddingHorizontal: spacing.screenPadding,
  },

  snackbar: {
    position: 'absolute',
    left: spacing.screenPadding,
    right: spacing.screenPadding,
    bottom: 24,
    backgroundColor: colors.ink,
    borderRadius: radii.sm,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  snackbarText: { color: colors.surface, fontSize: 14, textAlign: 'center' },
});
