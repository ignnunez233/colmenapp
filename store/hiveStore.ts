// Equivalente a: vm/HiveViewModel.kt
//
//> ÚNICO CAMBIO respecto a la versión conectada a Firebase: la línea
//> de import de abajo apunta a "hiveRepository.mock" en vez de
//> "hiveRepository". El resto de este archivo es idéntico — hiveStore
//> no sabe ni le importa si los datos vienen de Firestore o de un
//> Map en memoria, porque ambos archivos exponen las mismas funciones
//> con la misma forma (mismo contrato).
//>
//> Para retomar Firebase más adelante: cambiar esta única línea de
//> vuelta a "import * as hiveRepo from '../data/hiveRepository';"

import { create } from 'zustand';
import * as hiveRepo from '../data/hiveRepository.mock';
import type { Hive } from '../types/Hive';
import type { HiveNote } from '../types/HiveNote';

interface HiveStore {
  hives: Hive[];
  hive: Hive | null;
  notes: HiveNote[];

  observeMyHives: (uid: string) => () => void;
  observeHive: (hiveId: string) => Promise<void>;
  observeNotes: (hiveId: string) => () => void;

  create: (params: { uid: string; name: string; code: string; date: Date; type: string }) => Promise<string>;
  updateCover: (hiveId: string, url: string) => Promise<void>;
  addNote: (hiveId: string, text: string) => Promise<void>;
  editNote: (hiveId: string, noteId: string, newText: string) => Promise<void>;
  addAudioNote: (hiveId: string, text: string, audioUrl: string, durationSec: number) => Promise<void>;
}

export const useHiveStore = create<HiveStore>((set) => ({
  hives: [],
  hive: null,
  notes: [],

  observeMyHives: (uid) => hiveRepo.listenMyHives(uid, (list) => set({ hives: list })),

  observeHive: async (hiveId) => {
    const hive = await hiveRepo.getHiveById(hiveId);
    set({ hive });
  },

  observeNotes: (hiveId) => hiveRepo.listenNotes(hiveId, (list) => set({ notes: list })),

  create: async ({ uid, name, code, date, type }) => {
    if (!/^[A-Za-z0-9]+$/.test(code)) throw new Error('Código inválido');
    return hiveRepo.createHive({
      ownerUid: uid,
      name: name.toUpperCase(),
      code: code.toUpperCase(),
      installDate: date,
      type: type.toUpperCase(),
      queenState: 'UNKNOWN',
      createdAt: new Date(),
    });
  },

  updateCover: async (hiveId, url) => {
    await hiveRepo.updateCoverUrl(hiveId, url);
    const hive = await hiveRepo.getHiveById(hiveId);
    set({ hive });
  },

  addNote: async (hiveId, text) => {
    await hiveRepo.addNote(hiveId, text);
  },

  editNote: async (hiveId, noteId, newText) => {
    await hiveRepo.editNote(hiveId, noteId, newText);
  },

  addAudioNote: async (hiveId, text, audioUrl, durationSec) => {
    await hiveRepo.addNote(hiveId, text, audioUrl, durationSec);
  },
}));
