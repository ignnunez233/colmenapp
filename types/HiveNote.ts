// Equivalente a: data/model/HiveNote.kt

export interface HiveNote {
  id?: string;
  text: string;
  createdAt: Date;
  lastEditedAt: Date;
  audioUrl?: string;
  audioDurationSec?: number;
}
