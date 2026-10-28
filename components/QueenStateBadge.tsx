import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii } from '../theme/tokens';
import type { QueenState } from '../types/Hive';

const LABELS: Record<QueenState, string> = {
  ALIVE: 'Reina viva',
  DEAD: 'Reina muerta',
  UNKNOWN: 'Sin reina',
};

const DOT_COLOR: Record<QueenState, string> = {
  ALIVE: colors.alive,
  DEAD: colors.dead,
  UNKNOWN: colors.unknown,
};

export default function QueenStateBadge({ state }: { state: QueenState }) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.dot, { backgroundColor: DOT_COLOR[state] }]} />
      <Text style={styles.label}>{LABELS[state]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceMuted,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
    gap: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { color: colors.ink, fontSize: 13, fontWeight: '600' },
});
