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
