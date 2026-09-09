import type { GeneratedExercise } from '../engine/types'

const DB_NAME = 'sight-reading'
const DB_VERSION = 1
const STORE = 'practiceSessions'

/** Quick self-assessment, 1 (needs work) to 3 (great) — a lightweight stand-in until auto-grading exists. */
export interface SelfRating {
  rhythm?: 1 | 2 | 3
  pitch?: 1 | 2 | 3
  musicality?: 1 | 2 | 3
}

export interface PracticeSession {
  id: string
  createdAt: number
  exercise: GeneratedExercise
  audio: Blob | null
  selfRating?: SelfRating
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveSession(
  exercise: GeneratedExercise,
  audio: Blob | null,
  selfRating?: SelfRating,
): Promise<PracticeSession> {
  const session: PracticeSession = {
    id: `session-${exercise.id}-${Date.now()}`,
    createdAt: Date.now(),
    exercise,
    audio,
    selfRating,
  }
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(session)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
  return session
}

export async function listSessions(): Promise<PracticeSession[]> {
  const db = await openDb()
  const sessions = await new Promise<PracticeSession[]>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => resolve(req.result as PracticeSession[])
    req.onerror = () => reject(req.error)
  })
  db.close()
  return sessions.sort((a, b) => b.createdAt - a.createdAt)
}

export async function deleteSession(id: string): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}
