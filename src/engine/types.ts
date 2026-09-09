export type ClefType = 'treble' | 'bass'

export type Mode = 'major' | 'minor'

/** A single playable key, e.g. { tonicName: 'G', mode: 'major' }. */
export interface KeyDefinition {
  id: string
  /** Display/spelling of the tonic, e.g. "C", "G", "Bb", "F#". */
  tonicName: string
  /** MIDI pitch class of the tonic, 0-11. */
  tonicPitchClass: number
  mode: Mode
  /** Number of sharps (positive) or flats (negative) in the key signature. */
  fifths: number
  /** VexFlow key signature spec, e.g. "G", "Bb", "Am", "F#m". */
  vexKey: string
}

export interface PitchRange {
  /** MIDI note numbers, inclusive. */
  low: number
  high: number
}

export type AccidentalLevel = 'none' | 'occasional' | 'frequent'

/** Which rhythm cells are enabled, by id (see engine/rhythm.ts RHYTHM_CELLS). */
export interface RhythmVocabulary {
  cellIds: string[]
  allowRests: boolean
}

export interface GeneratorConstraints {
  clef: ClefType
  keys: KeyDefinition[]
  timeSignature: string
  measures: number
  range: PitchRange
  maxLeapSemitones: number
  stepwiseBias: number
  rhythm: RhythmVocabulary
  accidentals: AccidentalLevel
  dynamics: boolean
  articulations: boolean
  tempoBpm: number
}

export type NoteDuration = 'w' | 'h' | 'q' | '8' | '16'

export interface RhythmToken {
  dur: NoteDuration
  dots: 0 | 1
  isRest: boolean
  /** Position within the measure, in quarter-note beats. */
  offset: number
  /** Length of this token, in quarter-note beats. */
  quarterLength: number
}

export type DynamicMark = 'pp' | 'p' | 'mp' | 'mf' | 'f' | 'ff'
export type ArticulationMark = 'staccato' | 'accent' | 'tenuto'

export interface GeneratedNote extends RhythmToken {
  id: string
  /** MIDI note number, or null for a rest. */
  midi: number | null
  /** Accidental to render explicitly, if any. */
  accidental: null | '#' | 'b' | 'n'
  dynamic?: DynamicMark
  articulation?: ArticulationMark
}

export interface GeneratedExercise {
  id: string
  createdAt: number
  constraints: GeneratorConstraints
  key: KeyDefinition
  timeSignature: string
  clef: ClefType
  tempoBpm: number
  measures: GeneratedNote[][]
}
