// Equivalente a: data/model/Hive.kt

export type QueenState = 'UNKNOWN' | 'ALIVE' | 'DEAD';

export interface Hive {
  id?: string;
  ownerUid: string;
  name: string;
  code: string;
  installDate: Date;
  type: string;
  queenState: QueenState;
  coverUrl?: string;
  createdAt: Date;
}

export function safeQueenState(raw: unknown): QueenState {
  const value = String(raw ?? 'UNKNOWN').toUpperCase();
  if (value === 'ALIVE' || value === 'VIVA') return 'ALIVE';
  if (value === 'DEAD' || value === 'MUERTA') return 'DEAD';
  return 'UNKNOWN';
}
