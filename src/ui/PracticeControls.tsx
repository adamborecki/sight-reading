import type { NoteLabelMode } from '../engine/theory'

interface Props {
  isPlaying: boolean
  onPlay: () => void
  onStop: () => void
  tempoBpm: number
  onTempoChange: (bpm: number) => void
  fullTempoBpm: number
  rhythmOnly: boolean
  onRhythmOnlyToggle: (on: boolean) => void
  metronomeOn: boolean
  onMetronomeToggle: (on: boolean) => void
  countInOn: boolean
  onCountInToggle: (on: boolean) => void
  countInBeatsRemaining: number | null
  disappearingOn: boolean
  onDisappearingToggle: (on: boolean) => void
  onStartReading: () => void
  onResetReading: () => void
  labelMode: NoteLabelMode
  onLabelModeChange: (mode: NoteLabelMode) => void
  onPrint: () => void
}

export default function PracticeControls({
  isPlaying,
  onPlay,
  onStop,
  tempoBpm,
  onTempoChange,
  fullTempoBpm,
  rhythmOnly,
  onRhythmOnlyToggle,
  metronomeOn,
  onMetronomeToggle,
  countInOn,
  onCountInToggle,
  countInBeatsRemaining,
  disappearingOn,
  onDisappearingToggle,
  onStartReading,
  onResetReading,
  labelMode,
  onLabelModeChange,
  onPrint,
}: Props) {
  return (
    <section className="panel practice-controls">
      <h2>Practice tools</h2>
      <div className="field-row">
        {isPlaying ? (
          <button type="button" className="primary" onClick={onStop}>
            ⏹ Stop
          </button>
        ) : (
          <button type="button" className="primary" onClick={onPlay}>
            ▶ Play
          </button>
        )}
        <label>
          Tempo: {tempoBpm} bpm {tempoBpm < fullTempoBpm && <span className="hint">(full tempo: {fullTempoBpm})</span>}
          <input type="range" min={40} max={200} value={tempoBpm} onChange={(e) => onTempoChange(Number(e.target.value))} />
        </label>
      </div>
      <p className="hint tip">
        💡 Once you start, keep a steady tempo and keep going — even through a wrong note. Stopping to fix mistakes is
        practicing, not sight-reading. Start slower than full tempo and build up speed over a few tries.
      </p>

      <div className="field-row">
        <label className="checkbox">
          <input type="checkbox" checked={metronomeOn} onChange={(e) => onMetronomeToggle(e.target.checked)} />
          Metronome
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={countInOn} onChange={(e) => onCountInToggle(e.target.checked)} />
          Count-in
        </label>
        {countInBeatsRemaining !== null && countInBeatsRemaining > 0 && (
          <span className="count-in-badge">{countInBeatsRemaining}</span>
        )}
        <label className="checkbox">
          <input type="checkbox" checked={rhythmOnly} onChange={(e) => onRhythmOnlyToggle(e.target.checked)} />
          🥁 Rhythm only
        </label>
      </div>

      <div className="field-row">
        <label>
          Note labels
          <select value={labelMode} onChange={(e) => onLabelModeChange(e.target.value as NoteLabelMode)}>
            <option value="none">None</option>
            <option value="scaleDegree">Scale degrees (1–7)</option>
            <option value="solfege">Solfège (movable do)</option>
          </select>
        </label>
      </div>

      <div className="field-row">
        <label className="checkbox">
          <input type="checkbox" checked={disappearingOn} onChange={(e) => onDisappearingToggle(e.target.checked)} />
          Disappearing measures
        </label>
        <button type="button" disabled={!disappearingOn} onClick={onStartReading}>
          Start reading
        </button>
        <button type="button" onClick={onResetReading}>
          Reset
        </button>
        <button type="button" onClick={onPrint}>
          🖨️ Print
        </button>
      </div>
    </section>
  )
}
