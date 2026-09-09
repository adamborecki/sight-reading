import type { GeneratorConstraints } from './types'
import { keysWithMaxAccidentals, NOTE_NAME_TO_MIDI } from './theory'

export interface DifficultyPreset {
  id: string
  level: number
  name: string
  description: string
  constraints: GeneratorConstraints
}

const note = (name: string): number => NOTE_NAME_TO_MIDI[name]

export const DIFFICULTY_PRESETS: DifficultyPreset[] = [
  {
    id: 'level-1',
    level: 1,
    name: 'Level 1 — Beginner',
    description: 'Quarter/half/whole notes, a 5th range, one key (C major), no accidentals.',
    constraints: {
      clef: 'treble',
      keys: keysWithMaxAccidentals(0, ['major']),
      timeSignature: '4/4',
      measures: 4,
      range: { low: note('C4'), high: note('G4') },
      maxLeapSemitones: 4,
      stepwiseBias: 0.85,
      rhythm: { cellIds: ['q', 'rest_q', 'h', 'w'], allowRests: true },
      accidentals: 'none',
      dynamics: false,
      articulations: false,
      tempoBpm: 70,
    },
  },
  {
    id: 'level-2',
    level: 2,
    name: 'Level 2 — Early elementary',
    description: 'Adds eighth-note pairs, an octave range, and F/G major.',
    constraints: {
      clef: 'treble',
      keys: keysWithMaxAccidentals(1, ['major']),
      timeSignature: '4/4',
      measures: 4,
      range: { low: note('C4'), high: note('C5') },
      maxLeapSemitones: 5,
      stepwiseBias: 0.8,
      rhythm: { cellIds: ['q', 'rest_q', 'h', 'hd', 'w', '8_8', '8_rest8', 'rest8_8'], allowRests: true },
      accidentals: 'none',
      dynamics: false,
      articulations: false,
      tempoBpm: 80,
    },
  },
  {
    id: 'level-3',
    level: 3,
    name: 'Level 3 — Intermediate',
    description: '3/4 time, sixteenth-note cells, occasional accidentals, major & minor keys up to 2 sharps/flats.',
    constraints: {
      clef: 'treble',
      keys: keysWithMaxAccidentals(2),
      timeSignature: '3/4',
      measures: 6,
      range: { low: note('B3'), high: note('D5') },
      maxLeapSemitones: 7,
      stepwiseBias: 0.75,
      rhythm: {
        cellIds: ['q', 'rest_q', 'h', 'hd', '8_8', '8_rest8', 'rest8_8', '8_16_16', '16_16_8'],
        allowRests: true,
      },
      accidentals: 'occasional',
      dynamics: true,
      articulations: false,
      tempoBpm: 90,
    },
  },
  {
    id: 'level-4',
    level: 4,
    name: 'Level 4 — Advanced',
    description: '6/8 compound time, wider leaps, a 10th+ range, keys up to 3 sharps/flats.',
    constraints: {
      clef: 'treble',
      keys: keysWithMaxAccidentals(3),
      timeSignature: '6/8',
      measures: 4,
      range: { low: note('A3'), high: note('D5') },
      maxLeapSemitones: 9,
      stepwiseBias: 0.7,
      rhythm: { cellIds: ['c_qd', 'c_rest_qd', 'c_8_8_8', 'c_q_8', 'c_8_q', 'c_8_16_16_8'], allowRests: true },
      accidentals: 'occasional',
      dynamics: true,
      articulations: true,
      tempoBpm: 96,
    },
  },
  {
    id: 'level-5',
    level: 5,
    name: 'Level 5 — All-State style',
    description: 'Full rhythmic vocabulary with syncopation, wide leaps up to an octave, 2-octave range, frequent accidentals.',
    constraints: {
      clef: 'treble',
      keys: keysWithMaxAccidentals(4),
      timeSignature: '4/4',
      measures: 8,
      range: { low: note('C4'), high: note('C6') },
      maxLeapSemitones: 12,
      stepwiseBias: 0.6,
      rhythm: {
        cellIds: [
          'q', 'rest_q', 'h', 'hd', 'w',
          '8_8', '8_rest8', 'rest8_8', '16x4', '8_16_16', '16_16_8', '8d_16',
          'sync_8_q_8', 'sync_qd_8',
        ],
        allowRests: true,
      },
      accidentals: 'frequent',
      dynamics: true,
      articulations: true,
      tempoBpm: 108,
    },
  },
]

/** Shift a preset's constraints down two octaves for bass clef, or return as-is for treble. */
export function applyClef(constraints: GeneratorConstraints, clef: 'treble' | 'bass'): GeneratorConstraints {
  if (clef === constraints.clef) return constraints
  const shift = clef === 'bass' ? -24 : 24
  return {
    ...constraints,
    clef,
    range: { low: constraints.range.low + shift, high: constraints.range.high + shift },
  }
}
