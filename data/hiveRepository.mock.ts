// Reemplazo temporal de: data/hiveRepository.ts
//
//> Este archivo NO importa Firebase. Expone exactamente las mismas
//> funciones con las mismas firmas que hiveRepository.ts (createHive,
//> listenMyHives, getHiveById, addNote, listenNotes, etc.), pero guarda
//> todo en un array en memoria (se pierde al recargar la página/app).
//>
//> El propósito es que hiveStore.ts pueda seguir funcionando sin
//> ningún cambio en su lógica, sin que Metro necesite resolver
//> @react-native-firebase/firestore (que además no corre en web).
//>
//> Cuando se retome Firebase: basta con volver a importar desde
//> "./hiveRepository" en vez de "./hiveRepository.mock" en
//> store/hiveStore.ts (una sola línea de cambio, ver ese archivo).

import type { Hive, QueenState } from '../types/Hive';
import type { HiveNote } from '../types/HiveNote';

//> "Base de datos" en memoria. Usa un Map en vez de un array para que
//> buscar por id sea directo (equivalente conceptual a una colección
//> de Firestore indexada por documentId).
const hives = new Map<string, Hive>();
const notesByHive = new Map<string, HiveNote[]>();

//> Los listeners activos, para poder "notificar" cambios sin un
//> servidor real detrás (Firestore hace esto por su cuenta vía
//> onSnapshot; acá se simula a mano con un registro de callbacks).
const hiveListeners = new Set<(hives: Hive[]) => void>();
const noteListeners = new Map<string, Set<(notes: HiveNote[]) => void>>();

function notifyHiveListeners(uid: string) {
  const list = Array.from(hives.values())
    .filter((h) => h.ownerUid === uid)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  hiveListeners.forEach((cb) => cb(list));
}

function notifyNoteListeners(hiveId: string) {
  const list = (notesByHive.get(hiveId) ?? []).slice().sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  noteListeners.get(hiveId)?.forEach((cb) => cb(list));
}

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}

// ---------- Create ----------
export async function createHive(hive: Omit<Hive, 'id'>): Promise<string> {
  const id = nextId('hive');
  hives.set(id, { ...hive, id, createdAt: new Date() });
  notifyHiveListeners(hive.ownerUid);
  return id;
}

// ---------- One-shot list ----------
export async function listMyHives(uid: string): Promise<Hive[]> {
  return Array.from(hives.values())
    .filter((h) => h.ownerUid === uid)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// ---------- Live list ----------
export function listenMyHives(uid: string, onChange: (hives: Hive[]) => void): () => void {
  const wrapped = (list: Hive[]) => onChange(list.filter((h) => h.ownerUid === uid));
  hiveListeners.add(wrapped);
  //> Emite el estado actual de inmediato, igual que onSnapshot lo hace
  //> apenas te suscribes (no espera a que algo cambie para avisar).
  wrapped(Array.from(hives.values()));
  return () => hiveListeners.delete(wrapped);
}

export async function getHiveById(hiveId: string): Promise<Hive | null> {
  return hives.get(hiveId) ?? null;
}

export async function updateQueenState(hiveId: string, state: QueenState): Promise<void> {
  const hive = hives.get(hiveId);
  if (!hive) return;
  hives.set(hiveId, { ...hive, queenState: state });
  notifyHiveListeners(hive.ownerUid);
}

export async function updateCoverUrl(hiveId: string, url: string): Promise<void> {
  const hive = hives.get(hiveId);
  if (!hive) return;
  hives.set(hiveId, { ...hive, coverUrl: url });
  notifyHiveListeners(hive.ownerUid);
}

// ---------- Notes ----------
export async function addNote(
  hiveId: string,
  text: string,
  audioUrl: string | null = null,
  audioDurationSec: number | null = null
): Promise<void> {
  const list = notesByHive.get(hiveId) ?? [];
  const note: HiveNote = {
    id: nextId('note'),
    text,
    createdAt: new Date(),
    lastEditedAt: new Date(),
    audioUrl: audioUrl ?? undefined,
    audioDurationSec: audioDurationSec ?? undefined,
  };
  notesByHive.set(hiveId, [...list, note]);
  notifyNoteListeners(hiveId);
}

export function listenNotes(hiveId: string, onChange: (notes: HiveNote[]) => void): () => void {
  if (!noteListeners.has(hiveId)) noteListeners.set(hiveId, new Set());
  const set = noteListeners.get(hiveId)!;
  set.add(onChange);
  onChange(notesByHive.get(hiveId) ?? []);
  return () => set.delete(onChange);
}

export async function editNote(hiveId: string, noteId: string, newText: string): Promise<void> {
  const list = notesByHive.get(hiveId) ?? [];
  notesByHive.set(
    hiveId,
    list.map((n) => (n.id === noteId ? { ...n, text: newText, lastEditedAt: new Date() } : n))
  );
  notifyNoteListeners(hiveId);
}
