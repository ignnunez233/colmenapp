// Equivalente a: reminders/ui/ReminderCard.kt
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radii, spacing, minTouchTarget } from '../theme/tokens';
import { scheduleSoftReview, scheduleHardReview, scheduleCustomReminder } from './reminderScheduler';

interface Props {
  hiveName: string;
  onScheduled: (message: string) => void;
}

export default function ReminderCard({ hiveName, onScheduled }: Props) {
  const [loadingKind, setLoadingKind] = useState<string | null>(null);

  async function run(kind: string, action: () => Promise<{ ok: boolean; error?: string }>, successLabel: string) {
    setLoadingKind(kind);
    const result = await action();
    setLoadingKind(null);
    onScheduled(result.ok ? successLabel : result.error ?? 'No se pudo programar el recordatorio');
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Recordatorios</Text>

      <View style={styles.row}>
        <Pressable
          style={[styles.chip, { borderColor: colors.primary }]}
          disabled={loadingKind !== null}
          onPress={() => run('soft', () => scheduleSoftReview(hiveName), `Revisión suave programada en 3 días para "${hiveName}"`)}
        >
          {loadingKind === 'soft' ? <ActivityIndicator size="small" color={colors.primary} /> : <Text style={styles.chipText}>Revisión suave (3 días)</Text>}
        </Pressable>

        <Pressable
          style={[styles.chip, { borderColor: colors.dead }]}
          disabled={loadingKind !== null}
          onPress={() => run('hard', () => scheduleHardReview(hiveName), `Revisión dura programada en 5 días para "${hiveName}"`)}
        >
          {loadingKind === 'hard' ? <ActivityIndicator size="small" color={colors.dead} /> : <Text style={[styles.chipText, { color: colors.dead }]}>Revisión dura (5 días)</Text>}
        </Pressable>
      </View>

      <View style={styles.row}>
        <Pressable
          style={[styles.testChip, { backgroundColor: '#FFD84D' }]}
          disabled={loadingKind !== null}
          onPress={() => run('test1', () => scheduleCustomReminder(hiveName, 1), `Recordatorio programado en 1 min para "${hiveName}"`)}
        >
          <Text style={styles.testChipText}>Probar 1 min</Text>
        </Pressable>

        <Pressable
          style={[styles.testChip, { backgroundColor: colors.dead }]}
          disabled={loadingKind !== null}
          onPress={() => run('test5', () => scheduleCustomReminder(hiveName, 5), `Recordatorio programado en 5 min para "${hiveName}"`)}
        >
          <Text style={[styles.testChipText, { color: '#fff' }]}>Probar 5 min</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: spacing.screenPadding, backgroundColor: colors.surfaceMuted, borderRadius: radii.lg, padding: spacing.cardPadding, gap: spacing.gap },
  title: { fontSize: 15, fontWeight: '700', color: colors.ink },
  row: { flexDirection: 'row', gap: spacing.gap },
  chip: { flex: 1, borderWidth: 1, borderRadius: radii.sm, minHeight: minTouchTarget, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  chipText: { color: colors.primary, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  testChip: { flex: 1, borderRadius: radii.sm, minHeight: minTouchTarget, alignItems: 'center', justifyContent: 'center' },
  testChipText: { fontSize: 12, fontWeight: '700', color: colors.ink },
});
