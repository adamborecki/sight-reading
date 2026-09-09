import { useEffect, useRef, useState } from 'react'
import type { GeneratedExercise, GeneratorConstraints } from '../engine/types'
import { generateExercise } from '../engine/generator'
import { DIFFICULTY_PRESETS } from '../engine/presets'
import { parseTimeSignature, beatsPerMeasure } from '../engine/rhythm'
import { playExercise, unlockAudio, type PlaybackController } from '../audio/playback'
import { startMetronome } from '../audio/metronome'
import { startRecording, type RecordingHandle } from '../recording/recorder'
import { saveSession, listSessions, deleteSession, type PracticeSession } from '../recording/practiceLog'
import GeneratorPanel from './GeneratorPanel'
import ScoreView from './ScoreView'
import PracticeControls from './PracticeControls'
import RecordingPanel from './RecordingPanel'
import PracticeLogView from './PracticeLogView'

const INITIAL_PRESET = DIFFICULTY_PRESETS[0]

export default function App() {
  const [constraints, setConstraints] = useState<GeneratorConstraints>(INITIAL_PRESET.constraints)
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(INITIAL_PRESET.id)
  const [exercise, setExercise] = useState<GeneratedExercise | null>(null)
  const [view, setView] = useState<'practice' | 'log'>('practice')

  const [isPlaying, setIsPlaying] = useState(false)
  const [tempoBpm, setTempoBpm] = useState(INITIAL_PRESET.constraints.tempoBpm)
  const [metronomeOn, setMetronomeOn] = useState(false)
  const [countInOn, setCountInOn] = useState(true)
  const [countInBeatsRemaining, setCountInBeatsRemaining] = useState<number | null>(null)
  const [cursorNoteId, setCursorNoteId] = useState<string | null>(null)
  const [disappearingOn, setDisappearingOn] = useState(false)
  const [hiddenMeasures, setHiddenMeasures] = useState<Set<number>>(new Set())

  const [isRecording, setIsRecording] = useState(false)
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null)
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null)
  const [recordingError, setRecordingError] = useState<string | null>(null)
  const [sessions, setSessions] = useState<PracticeSession[]>([])

  const playbackControllerRef = useRef<PlaybackController | null>(null)
  const standaloneMetronomeStopRef = useRef<(() => void) | null>(null)
  const recordingHandleRef = useRef<RecordingHandle | null>(null)
  const readingTimersRef = useRef<number[]>([])

  useEffect(() => {
    setExercise(generateExercise(INITIAL_PRESET.constraints))
    refreshSessions()
    return () => {
      playbackControllerRef.current?.stop()
      standaloneMetronomeStopRef.current?.()
      clearReadingTimers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function refreshSessions() {
    setSessions(await listSessions())
  }

  function clearReadingTimers() {
    readingTimersRef.current.forEach((id) => window.clearTimeout(id))
    readingTimersRef.current = []
  }

  function handleSelectPreset(presetId: string) {
    const preset = DIFFICULTY_PRESETS.find((p) => p.id === presetId)
    if (!preset) return
    setConstraints(preset.constraints)
    setSelectedPresetId(presetId)
  }

  function handleConstraintsChange(next: GeneratorConstraints) {
    setConstraints(next)
    setSelectedPresetId(null)
  }

  function handleGenerate() {
    playbackControllerRef.current?.stop()
    standaloneMetronomeStopRef.current?.()
    clearReadingTimers()
    setIsPlaying(false)
    setCursorNoteId(null)
    setHiddenMeasures(new Set())
    setCountInBeatsRemaining(null)

    const next = generateExercise(constraints)
    setExercise(next)
    setTempoBpm(next.tempoBpm)
  }

  async function handlePlay() {
    if (!exercise) return
    standaloneMetronomeStopRef.current?.()
    standaloneMetronomeStopRef.current = null
    await unlockAudio()
    setIsPlaying(true)
    playbackControllerRef.current = playExercise(exercise, {
      metronome: metronomeOn,
      countIn: countInOn,
      tempoBpm,
      onNoteStart: (id) => setCursorNoteId(id),
      onCountInBeat: (n) => setCountInBeatsRemaining(n > 0 ? n : null),
      onCursorClear: () => setCursorNoteId(null),
      onFinished: () => setIsPlaying(false),
    })
  }

  function handleStop() {
    playbackControllerRef.current?.stop()
    playbackControllerRef.current = null
    setIsPlaying(false)
    setCursorNoteId(null)
    setCountInBeatsRemaining(null)
  }

  async function handleMetronomeToggle(on: boolean) {
    setMetronomeOn(on)
    if (isPlaying) return // takes effect on next play
    if (on) {
      await unlockAudio()
      const timeSig = parseTimeSignature((exercise ?? { timeSignature: constraints.timeSignature }).timeSignature)
      standaloneMetronomeStopRef.current = startMetronome(tempoBpm, beatsPerMeasure(timeSig))
    } else {
      standaloneMetronomeStopRef.current?.()
      standaloneMetronomeStopRef.current = null
    }
  }

  function handleDisappearingToggle(on: boolean) {
    setDisappearingOn(on)
    if (!on) {
      clearReadingTimers()
      setHiddenMeasures(new Set())
    }
  }

  function handleStartReading() {
    if (!exercise || !disappearingOn) return
    clearReadingTimers()
    setHiddenMeasures(new Set())
    const timeSig = parseTimeSignature(exercise.timeSignature)
    const secondsPerMeasure = (timeSig.measureQuarterLength * 60) / tempoBpm
    exercise.measures.forEach((_, idx) => {
      const id = window.setTimeout(() => {
        setHiddenMeasures((prev) => new Set(prev).add(idx))
      }, (idx + 1) * secondsPerMeasure * 1000)
      readingTimersRef.current.push(id)
    })
  }

  function handleResetReading() {
    clearReadingTimers()
    setHiddenMeasures(new Set())
  }

  function handlePrint() {
    window.print()
  }

  async function handleStartRecording() {
    try {
      setRecordingError(null)
      recordingHandleRef.current = await startRecording()
      setIsRecording(true)
    } catch {
      setRecordingError('Could not access the microphone. Check your browser permissions.')
    }
  }

  async function handleStopRecording() {
    if (!recordingHandleRef.current) return
    const blob = await recordingHandleRef.current.stop()
    recordingHandleRef.current = null
    setIsRecording(false)
    setRecordingBlob(blob)
    setRecordingUrl(URL.createObjectURL(blob))
  }

  async function handleSaveToLog() {
    if (!exercise || !recordingBlob) return
    await saveSession(exercise, recordingBlob)
    handleDiscardRecording()
    await refreshSessions()
    setView('log')
  }

  function handleDiscardRecording() {
    if (recordingUrl) URL.revokeObjectURL(recordingUrl)
    setRecordingBlob(null)
    setRecordingUrl(null)
  }

  async function handleDeleteSession(id: string) {
    await deleteSession(id)
    await refreshSessions()
  }

  function handleLoadSession(session: PracticeSession) {
    handleStop()
    setExercise(session.exercise)
    setTempoBpm(session.exercise.tempoBpm)
    setHiddenMeasures(new Set())
    setView('practice')
  }

  return (
    <div className="app">
      <header className="app-header no-print">
        <h1>🎼 Sight Reading</h1>
        <nav>
          <button type="button" className={view === 'practice' ? 'active' : ''} onClick={() => setView('practice')}>
            Practice
          </button>
          <button type="button" className={view === 'log' ? 'active' : ''} onClick={() => setView('log')}>
            Practice log
          </button>
        </nav>
      </header>

      {view === 'practice' ? (
        <main className="layout">
          <div className="sidebar no-print">
            <GeneratorPanel
              constraints={constraints}
              onConstraintsChange={handleConstraintsChange}
              onSelectPreset={handleSelectPreset}
              selectedPresetId={selectedPresetId}
              onGenerate={handleGenerate}
            />
            <RecordingPanel
              isRecording={isRecording}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              recordingUrl={recordingUrl}
              onSaveToLog={handleSaveToLog}
              onDiscard={handleDiscardRecording}
              error={recordingError}
            />
          </div>

          <div className="main-content">
            {exercise ? (
              <ScoreView exercise={exercise} cursorNoteId={cursorNoteId} hiddenMeasures={hiddenMeasures} />
            ) : (
              <p>Generating your first exercise…</p>
            )}
            <div className="no-print">
              <PracticeControls
                isPlaying={isPlaying}
                onPlay={handlePlay}
                onStop={handleStop}
                tempoBpm={tempoBpm}
                onTempoChange={setTempoBpm}
                metronomeOn={metronomeOn}
                onMetronomeToggle={handleMetronomeToggle}
                countInOn={countInOn}
                onCountInToggle={setCountInOn}
                countInBeatsRemaining={countInBeatsRemaining}
                disappearingOn={disappearingOn}
                onDisappearingToggle={handleDisappearingToggle}
                onStartReading={handleStartReading}
                onResetReading={handleResetReading}
                onPrint={handlePrint}
              />
            </div>
          </div>
        </main>
      ) : (
        <main className="layout">
          <PracticeLogView sessions={sessions} onLoad={handleLoadSession} onDelete={handleDeleteSession} />
        </main>
      )}
    </div>
  )
}
