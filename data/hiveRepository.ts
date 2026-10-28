// Equivalente a: data/repo/HiveRepository.kt
import { db } from '../firebase/config';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import type { Hive, QueenState } from '../types/Hive';
import type { HiveNote } from '../types/HiveNote';

type FirestoreDoc = FirebaseFirestoreTypes.DocumentSnapshot;

function toHiveSafe(doc: FirestoreDoc): Hive | null {
  const data = doc.data();
  if (!data) return null;

  const owner = data.ownerUid as string | undefined;
  const name = data.name as string | undefined;
  if (!owner || !name) return null;

  const createdAtTs = data.createdAt?.toDate?.() ?? new Date();
  const installDateTs = data.installDate?.toDate?.() ?? createdAtTs;

  const qsRaw = String(data.queenState ?? '').toUpperCase();
  let queenState: QueenState = 'UNKNOWN';
  if (qsRaw === 'ALIVE' || qsRaw === 'VIVA') queenState = 'ALIVE';
  else if (qsRaw === 'DEAD' || qsRaw === 'MUERTA') queenState = 'DEAD';

  return {
    id: doc.id,
    ownerUid: owner,
    name,
    code: data.code ?? '',
    type: data.type ?? '',
    createdAt: createdAtTs,
    installDate: installDateTs,
    coverUrl: data.coverUrl ?? undefined,
    queenState,
  };
}

export async function createHive(hive: Omit<Hive, 'id'>): Promise<string> {
  const docRef = await db().collection('hives').add({
    ...hive,
    createdAt: db.FieldValue.serverTimestamp(),
    installDate: hive.installDate,
  });
  return docRef.id;
}

export async function listMyHives(uid: string): Promise<Hive[]> {
  const snap = await db().collection('hives').where('ownerUid', '==', uid).get();
  return snap.docs
    .map(toHiveSafe)
    .filter((h): h is Hive => h !== null)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function listenMyHives(uid: string, onChange: (hives: Hive[]) => void): () => void {
  return db()
    .collection('hives')
    .where('ownerUid', '==', uid)
    .onSnapshot(
      (qs) => {
        const list = qs.docs
          .map(toHiveSafe)
          .filter((h): h is Hive => h !== null)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        onChange(list);
      },
      () => onChange([])
    );
}

export async function getHiveById(hiveId: string): Promise<Hive | null> {
  const doc = await db().collection('hives').doc(hiveId).get();
  return toHiveSafe(doc);
}

export async function updateQueenState(hiveId: string, state: QueenState): Promise<void> {
  await db().collection('hives').doc(hiveId).update({ queenState: state });
}

export async function updateCoverUrl(hiveId: string, url: string): Promise<void> {
  await db().collection('hives').doc(hiveId).update({ coverUrl: url });
}

export async function addNote(
  hiveId: string,
  text: string,
  audioUrl: string | null = null,
  audioDurationSec: number | null = null
): Promise<void> {
  await db().collection('hives').doc(hiveId).collection('notes').add({
    text,
    createdAt: db.FieldValue.serverTimestamp(),
    lastEditedAt: db.FieldValue.serverTimestamp(),
    audioUrl,
    audioDurationSec,
  });
}

export function listenNotes(hiveId: string, onChange: (notes: HiveNote[]) => void): () => void {
  return db()
    .collection('hives')
    .doc(hiveId)
    .collection('notes')
    .orderBy('createdAt')
    .onSnapshot(
      (qs) => {
        const list: HiveNote[] = qs.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            text: data.text ?? '',
            createdAt: data.createdAt?.toDate?.() ?? new Date(),
            lastEditedAt: data.lastEditedAt?.toDate?.() ?? new Date(),
            audioUrl: data.audioUrl ?? undefined,
            audioDurationSec: data.audioDurationSec ?? undefined,
          };
        });
        onChange(list);
      },
      () => onChange([])
    );
}

export async function editNote(hiveId: string, noteId: string, newText: string): Promise<void> {
  await db()
    .collection('hives')
    .doc(hiveId)
    .collection('notes')
    .doc(noteId)
    .update({ text: newText, lastEditedAt: db.FieldValue.serverTimestamp() });
}
