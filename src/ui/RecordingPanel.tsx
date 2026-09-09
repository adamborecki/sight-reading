import type { SelfRating } from '../recording/practiceLog'

export type RecordingPhase = 'idle' | 'studying' | 'priming' | 'counting' | 'recording'

interface Props {
  phase: RecordingPhase
  studySeconds: number
  onStudySecondsChange: (seconds: number) => void
  tonicPrimingOn: boolean
  onTonicPrimingToggle: (on: boolean) => void
  studySecondsRemaining: number | null
  countInBeatsRemaining: number | null
  onStart: () => void
  onCancel: () => void
  onStopRecording: () => void
  recordingUrl: string | null
  selfRating: SelfRating
  onRate: (category: keyof SelfRating, value: 1 | 2 | 3) => void
  onSaveToLog: () => void
  onDiscard: () => void
  error: string | null
}

const RATING_CATEGORIES: Array<{ key: keyof SelfRating; label: string }> = [
  { key: 'rhythm', label: 'Steady rhythm/tempo' },
  { key: 'pitch', label: 'Pitch accuracy' },
  { key: 'musicality', label: 'Dynamics & articulation' },
]

const RATING_FACES: Record<1 | 2 | 3, string> = { 1: '😕', 2: '🙂', 3: '🎉' }

export default function RecordingPanel({
  phase,
  studySeconds,
  onStudySecondsChange,
  tonicPrimingOn,
  onTonicPrimingToggle,
  studySecondsRemaining,
  countInBeatsRemaining,
  onStart,
  onCancel,
  onStopRecording,
  recordingUrl,
  selfRating,
  onRate,
  onSaveToLog,
  onDiscard,
  error,
}: Props) {
  return (
    <section className="panel recording-panel">
      <h2>Record yourself</h2>
      <p className="hint">Self-review only — recordings stay on this device.</p>

      {phase === 'idle' && !recordingUrl && (
        <>
          <div className="field-row">
            <label>
              Study time
              <select value={studySeconds} onChange={(e) => onStudySecondsChange(Number(e.target.value))}>
                <option value={0}>Off</option>
                <option value={10}>10s</option>
                <option value={15}>15s</option>
                <option value={30}>30s</option>
              </select>
            </label>
            <label className="checkbox">
              <input type="checkbox" checked={tonicPrimingOn} onChange={(e) => onTonicPrimingToggle(e.target.checked)} />
              Play tonic (do-mi-sol-do) first
            </label>
          </div>
          <p className="hint">
            Real sight-reading exams give you silent study time, then a moment to hear the key before you perform —
            this mirrors that.
          </p>
          <div className="field-row">
            <button type="button" className="primary" onClick={onStart}>
              🎤 Start
            </button>
          </div>
        </>
      )}

      {phase === 'studying' && (
        <div className="record-phase">
          <p className="phase-label">📖 Study your part…</p>
          <p className="phase-countdown">{studySecondsRemaining}</p>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      )}

      {phase === 'priming' && (
        <div className="record-phase">
          <p className="phase-label">🎵 Finding the key…</p>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      )}

      {phase === 'counting' && (
        <div className="record-phase">
          <p className="phase-label">Get ready…</p>
          <p className="phase-countdown">{countInBeatsRemaining}</p>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      )}

      {phase === 'recording' && (
        <div className="record-phase">
          <p className="phase-label recording-live">⏺ Recording — keep going, don't stop for mistakes</p>
          <button type="button" className="primary recording" onClick={onStopRecording}>
            ⏹ Stop
          </button>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {phase === 'idle' && recordingUrl && (
        <div className="review-block">
          <audio controls src={recordingUrl} />
          <div className="rating-block">
            <p className="hint">How do you think it went? (optional)</p>
            {RATING_CATEGORIES.map((cat) => (
              <div key={cat.key} className="rating-row">
                <span>{cat.label}</span>
                <span className="rating-faces">
                  {([1, 2, 3] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={`face-button ${selfRating[cat.key] === v ? 'selected' : ''}`}
                      onClick={() => onRate(cat.key, v)}
                    >
                      {RATING_FACES[v]}
                    </button>
                  ))}
                </span>
              </div>
            ))}
          </div>
          <div className="field-row">
            <button type="button" className="primary" onClick={onSaveToLog}>
              💾 Save to practice log
            </button>
            <button type="button" onClick={onDiscard}>
              Discard
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
