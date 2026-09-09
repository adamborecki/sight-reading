import type { KeyDefinition, Mode } from './types'

const PITCH_CLASS_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const PITCH_CLASS_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11]
const NATURAL_MINOR_STEPS = [0, 2, 3, 5, 7, 8, 10]

/** Circle-of-fifths major keys from 4 flats to 4 sharps, plus their relative minors. */
const MAJOR_KEYS: Array<{ tonicName: string; tonicPitchClass: number; fifths: number }> = [
  { tonicName: 'Ab', tonicPitchClass: 8, fifths: -4 },
  { tonicName: 'Eb', tonicPitchClass: 3, fifths: -3 },
  { tonicName: 'Bb', tonicPitchClass: 10, fifths: -2 },
  { tonicName: 'F', tonicPitchClass: 5, fifths: -1 },
  { tonicName: 'C', tonicPitchClass: 0, fifths: 0 },
  { tonicName: 'G', tonicPitchClass: 7, fifths: 1 },
  { tonicName: 'D', tonicPitchClass: 2, fifths: 2 },
  { tonicName: 'A', tonicPitchClass: 9, fifths: 3 },
  { tonicName: 'E', tonicPitchClass: 4, fifths: 4 },
]

const RELATIVE_MINOR_NAME: Record<string, string> = {
  Ab: 'F',
  Eb: 'C',
  Bb: 'G',
  F: 'D',
  C: 'A',
  G: 'E',
  D: 'B',
  A: 'F#',
  E: 'C#',
}

function buildKey(tonicName: string, tonicPitchClass: number, mode: Mode, fifths: number): KeyDefinition {
  const vexKey = mode === 'major' ? tonicName : `${tonicName}m`
  return {
    id: `${tonicName}-${mode}`,
    tonicName,
    tonicPitchClass,
    mode,
    fifths,
    vexKey,
  }
}

/** All keys the generator knows about, ordered roughly easy -> hard (fewer accidentals first). */
export const KEY_LIBRARY: KeyDefinition[] = (() => {
  const keys: KeyDefinition[] = []
  for (const mk of MAJOR_KEYS) {
    keys.push(buildKey(mk.tonicName, mk.tonicPitchClass, 'major', mk.fifths))
  }
  for (const mk of MAJOR_KEYS) {
    const minorTonicName = RELATIVE_MINOR_NAME[mk.tonicName]
    const minorPitchClass = (mk.tonicPitchClass + 9) % 12 // relative minor = major - 3 semitones
    keys.push(buildKey(minorTonicName, minorPitchClass, 'minor', mk.fifths))
  }
  return keys.sort((a, b) => Math.abs(a.fifths) - Math.abs(b.fifths))
})()

export function findKey(id: string): KeyDefinition {
  const key = KEY_LIBRARY.find((k) => k.id === id)
  if (!key) throw new Error(`Unknown key id: ${id}`)
  return key
}

export function keysWithMaxAccidentals(maxFifths: number, modes: Mode[] = ['major', 'minor']): KeyDefinition[] {
  return KEY_LIBRARY.filter((k) => Math.abs(k.fifths) <= maxFifths && modes.includes(k.mode))
}

/** Diatonic pitch classes (0-11) for a key, using natural minor for minor keys. */
export function diatonicPitchClasses(key: KeyDefinition): Set<number> {
  const steps = key.mode === 'major' ? MAJOR_STEPS : NATURAL_MINOR_STEPS
  return new Set(steps.map((s) => (key.tonicPitchClass + s) % 12))
}

/** The raised leading tone pitch class for a minor key (harmonic-minor 7th degree). */
export function raisedLeadingTone(key: KeyDefinition): number | null {
  if (key.mode !== 'minor') return null
  return (key.tonicPitchClass + 11) % 12
}

/** Whether a key signature "prefers" flat or sharp spelling for chromatic notes. */
export function prefersFlats(key: KeyDefinition): boolean {
  return key.fifths < 0
}

/** Explicit accidental to render for this pitch, or null if the key signature already covers it. */
export function accidentalForPitch(midi: number, key: KeyDefinition): null | '#' | 'b' {
  const pitchClass = ((midi % 12) + 12) % 12
  if (diatonicPitchClasses(key).has(pitchClass)) return null
  const names = prefersFlats(key) ? PITCH_CLASS_NAMES_FLAT : PITCH_CLASS_NAMES_SHARP
  const name = names[pitchClass]
  if (name.includes('#')) return '#'
  if (name.includes('b')) return 'b'
  return null
}

export function midiToNoteName(midi: number, key: KeyDefinition): { letter: string; octave: number; vexKey: string } {
  const pitchClass = ((midi % 12) + 12) % 12
  const octave = Math.floor(midi / 12) - 1
  const names = prefersFlats(key) ? PITCH_CLASS_NAMES_FLAT : PITCH_CLASS_NAMES_SHARP
  const letter = names[pitchClass]
  // VexFlow key format: "c#/4", "bb/3"
  const vexLetter = letter.length > 1 ? `${letter[0].toLowerCase()}${letter[1] === '#' ? '#' : 'b'}` : letter.toLowerCase()
  return { letter, octave, vexKey: `${vexLetter}/${octave}` }
}

/** MIDI numbers for common note-name anchors, used by range pickers. */
export const NOTE_NAME_TO_MIDI: Record<string, number> = (() => {
  const map: Record<string, number> = {}
  for (let octave = 0; octave <= 8; octave++) {
    PITCH_CLASS_NAMES_SHARP.forEach((name, pc) => {
      map[`${name}${octave}`] = (octave + 1) * 12 + pc
    })
  }
  return map
})()

export function clampToRange(midi: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, midi))
}

/** Note-name/MIDI pairs from C2 to C7, sorted low to high — used by range pickers in the UI. */
export const NOTE_OPTIONS: Array<{ name: string; midi: number }> = Object.entries(NOTE_NAME_TO_MIDI)
  .filter(([, midi]) => midi >= 36 && midi <= 96)
  .map(([name, midi]) => ({ name, midi }))
  .sort((a, b) => a.midi - b.midi)
