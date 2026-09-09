import type { DynamicMark, GeneratedExercise, GeneratedNote, GeneratorConstraints } from './types'
import { Rng } from './random'
import { accidentalForPitch } from './theory'
import { generateRhythmForMeasure, parseTimeSignature } from './rhythm'
import { generatePitchSequence } from './pitch'

const DYNAMICS: DynamicMark[] = ['p', 'mp', 'mf', 'f']

let counter = 0
function nextId(prefix: string): string {
  counter += 1
  return `${prefix}-${Date.now().toString(36)}-${counter}`
}

export function generateExercise(constraints: GeneratorConstraints, seed?: number): GeneratedExercise {
  const rng = new Rng(seed)
  if (constraints.keys.length === 0) throw new Error('At least one key must be allowed')
  const key = rng.pick(constraints.keys)
  const timeSig = parseTimeSignature(constraints.timeSignature)
  const cellIds = new Set(constraints.rhythm.cellIds)

  const measureRhythms = Array.from({ length: constraints.measures }, () =>
    generateRhythmForMeasure(timeSig, cellIds, constraints.rhythm.allowRests, rng),
  )

  const pitchedSlots = measureRhythms.reduce((sum, m) => sum + m.filter((t) => !t.isRest).length, 0)
  const pitches = generatePitchSequence(
    pitchedSlots,
    key,
    constraints.range,
    constraints.maxLeapSemitones,
    constraints.stepwiseBias,
    constraints.accidentals,
    rng,
  )

  let pitchCursor = 0
  const measures: GeneratedNote[][] = measureRhythms.map((tokens, measureIndex) => {
    return tokens.map((token, tokenIndex) => {
      const midi = token.isRest ? null : pitches[pitchCursor++]
      const accidental = midi === null ? null : accidentalForPitch(midi, key)
      const note: GeneratedNote = {
        ...token,
        id: nextId('note'),
        midi,
        accidental,
      }
      if (constraints.dynamics && measureIndex === 0 && tokenIndex === 0) {
        note.dynamic = rng.pick(DYNAMICS)
      }
      if (constraints.articulations && !token.isRest && rng.bool(0.15)) {
        note.articulation = rng.pick(['staccato', 'accent', 'tenuto'] as const)
      }
      return note
    })
  })

  return {
    id: nextId('exercise'),
    createdAt: Date.now(),
    constraints,
    key,
    timeSignature: constraints.timeSignature,
    clef: constraints.clef,
    tempoBpm: constraints.tempoBpm,
    measures,
  }
}
