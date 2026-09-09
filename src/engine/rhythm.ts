import type { NoteDuration, RhythmToken } from './types'
import type { Rng } from './random'

export interface RhythmCellToken {
  dur: NoteDuration
  dots: 0 | 1
  isRest: boolean
}

export interface RhythmCell {
  id: string
  label: string
  meterType: 'simple' | 'compound'
  /** Length of this cell in quarter-note beats. */
  quarterLength: number
  tokens: RhythmCellToken[]
  /** Only usable when the cell starts on an even beat (0-indexed) -- used for cells that cross a beat. */
  requiresEvenStart?: boolean
}

// --- Simple meter cells (2/4, 3/4, 4/4) -----------------------------------

export const SIMPLE_CELLS: RhythmCell[] = [
  { id: 'q', label: 'Quarter note', meterType: 'simple', quarterLength: 1, tokens: [{ dur: 'q', dots: 0, isRest: false }] },
  { id: 'rest_q', label: 'Quarter rest', meterType: 'simple', quarterLength: 1, tokens: [{ dur: 'q', dots: 0, isRest: true }] },
  {
    id: '8_8',
    label: 'Two eighths',
    meterType: 'simple',
    quarterLength: 1,
    tokens: [{ dur: '8', dots: 0, isRest: false }, { dur: '8', dots: 0, isRest: false }],
  },
  {
    id: '8_rest8',
    label: 'Eighth + eighth rest',
    meterType: 'simple',
    quarterLength: 1,
    tokens: [{ dur: '8', dots: 0, isRest: false }, { dur: '8', dots: 0, isRest: true }],
  },
  {
    id: 'rest8_8',
    label: 'Eighth rest + eighth',
    meterType: 'simple',
    quarterLength: 1,
    tokens: [{ dur: '8', dots: 0, isRest: true }, { dur: '8', dots: 0, isRest: false }],
  },
  { id: 'h', label: 'Half note', meterType: 'simple', quarterLength: 2, tokens: [{ dur: 'h', dots: 0, isRest: false }] },
  { id: 'rest_h', label: 'Half rest', meterType: 'simple', quarterLength: 2, tokens: [{ dur: 'h', dots: 0, isRest: true }] },
  { id: 'hd', label: 'Dotted half note', meterType: 'simple', quarterLength: 3, tokens: [{ dur: 'h', dots: 1, isRest: false }] },
  { id: 'w', label: 'Whole note', meterType: 'simple', quarterLength: 4, tokens: [{ dur: 'w', dots: 0, isRest: false }] },
  {
    id: '16x4',
    label: 'Four sixteenths',
    meterType: 'simple',
    quarterLength: 1,
    tokens: [
      { dur: '16', dots: 0, isRest: false },
      { dur: '16', dots: 0, isRest: false },
      { dur: '16', dots: 0, isRest: false },
      { dur: '16', dots: 0, isRest: false },
    ],
  },
  {
    id: '8_16_16',
    label: 'Eighth + two sixteenths',
    meterType: 'simple',
    quarterLength: 1,
    tokens: [
      { dur: '8', dots: 0, isRest: false },
      { dur: '16', dots: 0, isRest: false },
      { dur: '16', dots: 0, isRest: false },
    ],
  },
  {
    id: '16_16_8',
    label: 'Two sixteenths + eighth',
    meterType: 'simple',
    quarterLength: 1,
    tokens: [
      { dur: '16', dots: 0, isRest: false },
      { dur: '16', dots: 0, isRest: false },
      { dur: '8', dots: 0, isRest: false },
    ],
  },
  {
    id: '8d_16',
    label: 'Dotted eighth + sixteenth',
    meterType: 'simple',
    quarterLength: 1,
    tokens: [{ dur: '8', dots: 1, isRest: false }, { dur: '16', dots: 0, isRest: false }],
  },
  {
    id: 'sync_8_q_8',
    label: 'Syncopation: eighth-quarter-eighth',
    meterType: 'simple',
    quarterLength: 2,
    requiresEvenStart: true,
    tokens: [
      { dur: '8', dots: 0, isRest: false },
      { dur: 'q', dots: 0, isRest: false },
      { dur: '8', dots: 0, isRest: false },
    ],
  },
  {
    id: 'sync_qd_8',
    label: 'Syncopation: dotted quarter + eighth',
    meterType: 'simple',
    quarterLength: 2,
    requiresEvenStart: true,
    tokens: [{ dur: 'q', dots: 1, isRest: false }, { dur: '8', dots: 0, isRest: false }],
  },
]

// --- Compound meter cells (6/8, 9/8, 12/8), each cell = one dotted-quarter beat (1.5 quarterLength) ---

export const COMPOUND_CELLS: RhythmCell[] = [
  {
    id: 'c_qd',
    label: 'Dotted quarter',
    meterType: 'compound',
    quarterLength: 1.5,
    tokens: [{ dur: 'q', dots: 1, isRest: false }],
  },
  {
    id: 'c_rest_qd',
    label: 'Dotted quarter rest',
    meterType: 'compound',
    quarterLength: 1.5,
    tokens: [{ dur: 'q', dots: 1, isRest: true }],
  },
  {
    id: 'c_8_8_8',
    label: 'Three eighths',
    meterType: 'compound',
    quarterLength: 1.5,
    tokens: [
      { dur: '8', dots: 0, isRest: false },
      { dur: '8', dots: 0, isRest: false },
      { dur: '8', dots: 0, isRest: false },
    ],
  },
  {
    id: 'c_q_8',
    label: 'Quarter + eighth',
    meterType: 'compound',
    quarterLength: 1.5,
    tokens: [{ dur: 'q', dots: 0, isRest: false }, { dur: '8', dots: 0, isRest: false }],
  },
  {
    id: 'c_8_q',
    label: 'Eighth + quarter',
    meterType: 'compound',
    quarterLength: 1.5,
    tokens: [{ dur: '8', dots: 0, isRest: false }, { dur: 'q', dots: 0, isRest: false }],
  },
  {
    id: 'c_8_16_16_8',
    label: 'Eighth + two sixteenths + eighth',
    meterType: 'compound',
    quarterLength: 1.5,
    tokens: [
      { dur: '8', dots: 0, isRest: false },
      { dur: '16', dots: 0, isRest: false },
      { dur: '16', dots: 0, isRest: false },
      { dur: '8', dots: 0, isRest: false },
    ],
  },
]

export const ALL_CELLS = [...SIMPLE_CELLS, ...COMPOUND_CELLS]

export function findCell(id: string): RhythmCell {
  const cell = ALL_CELLS.find((c) => c.id === id)
  if (!cell) throw new Error(`Unknown rhythm cell id: ${id}`)
  return cell
}

/** Rest cells are picked far less often than pitched cells, so exercises don't drown in rests. */
function cellWeight(cell: RhythmCell): number {
  const hasRest = cell.tokens.some((t) => t.isRest)
  return hasRest ? 1 : 5
}

export interface TimeSignatureInfo {
  numerator: number
  denominator: number
  meterType: 'simple' | 'compound'
  /** Total length of one measure, in quarter-note beats. */
  measureQuarterLength: number
}

export function parseTimeSignature(sig: string): TimeSignatureInfo {
  const [numStr, denStr] = sig.split('/')
  const numerator = Number(numStr)
  const denominator = Number(denStr)
  const measureQuarterLength = (numerator * 4) / denominator
  const meterType: 'simple' | 'compound' = denominator === 8 && numerator % 3 === 0 && numerator >= 6 ? 'compound' : 'simple'
  return { numerator, denominator, meterType, measureQuarterLength }
}

/**
 * Fills one measure with rhythm cells drawn from the enabled vocabulary, respecting the
 * measure's total length. Falls back to plain quarter notes/rests if the vocabulary can't
 * exactly fill the remaining space, so generation never fails outright.
 */
export function generateRhythmForMeasure(
  timeSig: TimeSignatureInfo,
  enabledCellIds: Set<string>,
  allowRests: boolean,
  rng: Rng,
): RhythmToken[] {
  const pool = ALL_CELLS.filter((c) => c.meterType === timeSig.meterType && enabledCellIds.has(c.id) && (allowRests || !c.tokens.some((t) => t.isRest)))
  const fallback = timeSig.meterType === 'compound' ? findCell('c_qd') : findCell('q')

  const tokens: RhythmToken[] = []
  let offset = 0
  const total = timeSig.measureQuarterLength
  let guard = 0
  while (offset < total - 1e-6 && guard < 64) {
    guard++
    const remaining = total - offset
    const beatIndex = Math.round(offset)
    const candidates = pool.filter((c) => c.quarterLength <= remaining + 1e-6 && (!c.requiresEvenStart || beatIndex % 2 === 0))
    const cell =
      candidates.length > 0
        ? rng.weighted(candidates.map((c) => ({ value: c, weight: cellWeight(c) })))
        : fallback.quarterLength <= remaining + 1e-6
          ? fallback
          : null
    if (!cell) {
      // Remaining space smaller than any cell (shouldn't normally happen); pad with a rest/tie-safe note.
      tokens.push({ dur: '16', dots: 0, isRest: true, offset, quarterLength: remaining })
      break
    }
    for (const t of cell.tokens) {
      const ql = durationToQuarterLength(t.dur, t.dots)
      tokens.push({ dur: t.dur, dots: t.dots, isRest: t.isRest, offset, quarterLength: ql })
      offset += ql
    }
  }
  return tokens
}

/** Number of "feel" beats per measure for metronome/count-in purposes (dotted-quarter beats in compound meter). */
export function beatsPerMeasure(timeSig: TimeSignatureInfo): number {
  const beatQL = timeSig.meterType === 'compound' ? 1.5 : 4 / timeSig.denominator
  return timeSig.measureQuarterLength / beatQL
}

export function durationToQuarterLength(dur: NoteDuration, dots: 0 | 1): number {
  const base = { w: 4, h: 2, q: 1, '8': 0.5, '16': 0.25 }[dur]
  return dots ? base * 1.5 : base
}
