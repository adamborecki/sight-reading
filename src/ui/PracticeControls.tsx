interface Props {
  isPlaying: boolean
  onPlay: () => void
  onStop: () => void
  tempoBpm: number
  onTempoChange: (bpm: number) => void
  metronomeOn: boolean
  onMetronomeToggle: (on: boolean) => void
  countInOn: boolean
  onCountInToggle: (on: boolean) => void
  countInBeatsRemaining: number | null
  disappearingOn: boolean
  onDisappearingToggle: (on: boolean) => void
  onStartReading: () => void
  onResetReading: () => void
  onPrint: () => void
}

export default function PracticeControls({
  isPlaying,
  onPlay,
  onStop,
  tempoBpm,
  onTempoChange,
  metronomeOn,
  onMetronomeToggle,
  countInOn,
  onCountInToggle,
  countInBeatsRemaining,
  disappearingOn,
  onDisappearingToggle,
  onStartReading,
  onResetReading,
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
          Tempo: {tempoBpm} bpm
          <input type="range" min={40} max={200} value={tempoBpm} onChange={(e) => onTempoChange(Number(e.target.value))} />
        </label>
      </div>

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
