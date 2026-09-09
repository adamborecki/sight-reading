import * as Tone from 'tone'
import type { GeneratedExercise } from '../engine/types'
import { midiToNoteName } from '../engine/theory'
import { beatsPerMeasure, parseTimeSignature } from '../engine/rhythm'
import { getClickSynth, getMelodySynth } from './synths'

export { unlockAudio } from './synths'

export interface PlaybackOptions {
  metronome: boolean
  countIn: boolean
  /** Overrides the exercise's baked-in tempo for this playback (practice tempo control). */
  tempoBpm?: number
  /** Play every pitched note on a single fixed pitch, to isolate rhythm from pitch reading. */
  rhythmOnly?: boolean
  onNoteStart?: (noteId: string) => void
  onCountInBeat?: (beatsRemaining: number) => void
  onCursorClear?: () => void
  onFinished?: () => void
}

export interface PlaybackController {
  stop: () => void
  totalDurationSeconds: number
}

export function playExercise(exercise: GeneratedExercise, options: PlaybackOptions): PlaybackController {
  const melody = getMelodySynth()
  const click = getClickSynth()
  const transport = Tone.getTransport()
  transport.stop()
  transport.cancel(0)
  Tone.getDraw().cancel(0)
  const tempoBpm = options.tempoBpm ?? exercise.tempoBpm
  transport.position = 0
  transport.bpm.value = tempoBpm

  const secondsPerQuarter = 60 / tempoBpm
  const timeSig = parseTimeSignature(exercise.timeSignature)
  const beatQL = timeSig.meterType === 'compound' ? 1.5 : 4 / timeSig.denominator
  const beatCount = beatsPerMeasure(timeSig)

  let cursor = 0 // seconds

  if (options.countIn) {
    for (let b = 0; b < beatCount; b++) {
      const t = cursor + b * beatQL * secondsPerQuarter
      const pitch = b === 0 ? 'C6' : 'G5'
      transport.scheduleOnce((time) => click.triggerAttackRelease(pitch, '32n', time), t)
      if (options.onCountInBeat) {
        const remaining = beatCount - b
        transport.scheduleOnce((time) => {
          Tone.getDraw().schedule(() => options.onCountInBeat?.(remaining), time)
        }, t)
      }
    }
    cursor += beatCount * beatQL * secondsPerQuarter
  }

  const playbackStart = cursor
  if (options.countIn && options.onCountInBeat) {
    transport.scheduleOnce((time) => {
      Tone.getDraw().schedule(() => options.onCountInBeat?.(0), time)
    }, playbackStart)
  }
  let measureStartSeconds = playbackStart
  exercise.measures.forEach((measure) => {
    measure.forEach((note) => {
      const t = measureStartSeconds + note.offset * secondsPerQuarter
      const durSeconds = note.quarterLength * secondsPerQuarter * 0.95
      if (!note.isRest && note.midi !== null) {
        if (options.rhythmOnly) {
          transport.scheduleOnce((time) => click.triggerAttackRelease('A4', durSeconds, time), t)
        } else {
          const noteName = toneNoteName(note.midi, exercise)
          transport.scheduleOnce((time) => melody.triggerAttackRelease(noteName, durSeconds, time), t)
        }
      }
      if (options.onNoteStart) {
        transport.scheduleOnce((time) => {
          Tone.getDraw().schedule(() => options.onNoteStart?.(note.id), time)
        }, t)
      }
      if (options.metronome && Math.abs(note.offset % beatQL) < 1e-6) {
        const beatInMeasure = Math.round(note.offset / beatQL)
        const pitch = beatInMeasure === 0 ? 'C6' : 'G5'
        transport.scheduleOnce((time) => click.triggerAttackRelease(pitch, '32n', time), t)
      }
    })
    measureStartSeconds += timeSig.measureQuarterLength * secondsPerQuarter
  })

  const totalDurationSeconds = measureStartSeconds
  transport.scheduleOnce(() => {
    Tone.getDraw().schedule(() => {
      options.onCursorClear?.()
      options.onFinished?.()
    }, totalDurationSeconds)
  }, totalDurationSeconds)

  transport.start()

  return {
    totalDurationSeconds,
    stop: () => {
      transport.stop()
      transport.cancel(0)
      Tone.getDraw().cancel(0)
      melody.releaseAll()
    },
  }
}

function toneNoteName(midi: number, exercise: GeneratedExercise): string {
  const { letter, octave } = midiToNoteName(midi, exercise.key)
  return `${letter}${octave}`
}
