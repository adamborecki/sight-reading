interface Props {
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  recordingUrl: string | null
  onSaveToLog: () => void
  onDiscard: () => void
  error: string | null
}

export default function RecordingPanel({
  isRecording,
  onStartRecording,
  onStopRecording,
  recordingUrl,
  onSaveToLog,
  onDiscard,
  error,
}: Props) {
  return (
    <section className="panel recording-panel">
      <h2>Record yourself</h2>
      <p className="hint">Self-review only — recordings stay on this device.</p>
      <div className="field-row">
        {isRecording ? (
          <button type="button" className="primary recording" onClick={onStopRecording}>
            ⏺ Stop recording
          </button>
        ) : (
          <button type="button" className="primary" onClick={onStartRecording}>
            🎤 Start recording
          </button>
        )}
      </div>
      {error && <p className="error">{error}</p>}
      {recordingUrl && (
        <div className="field-row">
          <audio controls src={recordingUrl} />
          <button type="button" onClick={onSaveToLog}>
            💾 Save to practice log
          </button>
          <button type="button" onClick={onDiscard}>
            Discard
          </button>
        </div>
      )}
    </section>
  )
}
