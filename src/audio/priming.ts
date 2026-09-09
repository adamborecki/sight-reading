import * as Tone from 'tone'
import type { KeyDefinition } from '../engine/types'
import { getMelodySynth } from './synths'

/**
 * Plays a short tonic-orienting cue — do-mi-sol-do (major) or do-me-sol-do (minor) — the standard
 * sight-singing technique for establishing the key before reading. Resolves once it's finished.
 */
export async function playTonicPriming(key: KeyDefinition): Promise<void> {
  await Tone.start()
  const synth = getMelodySynth()
  const third = key.mode === 'major' ? 4 : 3
  const semitoneSteps = [0, third, 7, 12]
  const noteSeconds = 0.32
  const gapSeconds = 0.36
  const base = Tone.now() + 0.05

  semitoneSteps.forEach((steps, i) => {
    const midi = 60 + key.tonicPitchClass + steps
    const freq = Tone.Frequency(midi, 'midi').toFrequency()
    synth.triggerAttackRelease(freq, noteSeconds, base + i * gapSeconds)
  })

  const totalMs = (semitoneSteps.length * gapSeconds + noteSeconds) * 1000
  await new Promise((resolve) => setTimeout(resolve, totalMs))
}
