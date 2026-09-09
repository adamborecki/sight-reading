import { useMemo } from 'react'
import type { PracticeSession } from '../recording/practiceLog'

interface Props {
  sessions: PracticeSession[]
  onLoad: (session: PracticeSession) => void
  onDelete: (id: string) => void
}

function AudioCell({ blob }: { blob: Blob | null }) {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob])
  if (!url) return <span className="hint">No recording</span>
  return <audio controls src={url} />
}

const RATING_FACES: Record<1 | 2 | 3, string> = { 1: '😕', 2: '🙂', 3: '🎉' }
const RATING_LABELS: Record<'rhythm' | 'pitch' | 'musicality', string> = {
  rhythm: 'Rhythm',
  pitch: 'Pitch',
  musicality: 'Musicality',
}

function SelfRatingBadges({ rating }: { rating: PracticeSession['selfRating'] }) {
  if (!rating || (!rating.rhythm && !rating.pitch && !rating.musicality)) return null
  return (
    <div className="rating-badges">
      {(Object.keys(RATING_LABELS) as Array<keyof typeof RATING_LABELS>).map((key) => {
        const value = rating[key]
        if (!value) return null
        return (
          <span key={key} className="rating-badge" title={RATING_LABELS[key]}>
            {RATING_LABELS[key]} {RATING_FACES[value]}
          </span>
        )
      })}
    </div>
  )
}

export default function PracticeLogView({ sessions, onLoad, onDelete }: Props) {
  if (sessions.length === 0) {
    return (
      <section className="panel">
        <h2>Practice log</h2>
        <p className="hint">Nothing saved yet. Record a session and save it to see it here.</p>
      </section>
    )
  }

  return (
    <section className="panel">
      <h2>Practice log</h2>
      <ul className="session-list">
        {sessions.map((s) => (
          <li key={s.id} className="session-row">
            <div className="session-meta">
              <strong>
                {s.exercise.key.tonicName} {s.exercise.key.mode}, {s.exercise.timeSignature}
              </strong>
              <span className="hint">
                {new Date(s.createdAt).toLocaleString()} · {s.exercise.measures.length} measures
              </span>
            </div>
            <AudioCell blob={s.audio} />
            <SelfRatingBadges rating={s.selfRating} />
            <div className="field-row">
              <button type="button" onClick={() => onLoad(s)}>
                View score
              </button>
              <button type="button" onClick={() => onDelete(s.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
