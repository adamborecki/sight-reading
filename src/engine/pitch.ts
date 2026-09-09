import type { AccidentalLevel, KeyDefinition, PitchRange } from './types'
import type { Rng } from './random'
import { diatonicPitchClasses, raisedLeadingTone } from './theory'

/** Sorted MIDI numbers within range whose pitch class is diatonic to the key. */
function diatonicPool(key: KeyDefinition, range: PitchRange): number[] {
  const classes = diatonicPitchClasses(key)
  const pool: number[] = []
  for (let m = range.low; m <= range.high; m++) {
    if (classes.has(((m % 12) + 12) % 12)) pool.push(m)
  }
  return pool
}

function nearestInPool(pool: number[], target: number): number {
  let best = pool[0]
  let bestDist = Math.abs(pool[0] - target)
  for (const m of pool) {
    const d = Math.abs(m - target)
    if (d < bestDist) {
      best = m
      bestDist = d
    }
  }
  return best
}

const ACCIDENTAL_PROBABILITY: Record<AccidentalLevel, number> = { none: 0, occasional: 0.12, frequent: 0.32 }

/**
 * Generates `count` pitched degrees (MIDI numbers) inside `range`, mostly stepwise with
 * occasional constrained leaps, resolving large leaps by step, and cadencing on the tonic.
 */
export function generatePitchSequence(
  count: number,
  key: KeyDefinition,
  range: PitchRange,
  maxLeapSemitones: number,
  stepwiseBias: number,
  accidentals: AccidentalLevel,
  rng: Rng,
): number[] {
  const pool = diatonicPool(key, range)
  if (pool.length === 0) throw new Error('Range is too narrow to contain any diatonic pitch for the selected key')
  if (count === 0) return []

  const mid = (range.low + range.high) / 2
  const tonicCandidates = pool.filter((m) => ((m % 12) + 12) % 12 === key.tonicPitchClass)
  let current = tonicCandidates.length > 0 ? nearestInPool(tonicCandidates, mid) : nearestInPool(pool, mid)

  const result: number[] = [current]
  let forcedResolveDirection: 1 | -1 | 0 = 0
  const recent: number[] = [current]

  for (let i = 1; i < count; i++) {
    const idx = pool.indexOf(current)
    let next: number

    const isLast = i === count - 1
    if (isLast) {
      next = tonicCandidates.length > 0 ? nearestInPool(tonicCandidates, current) : current
    } else {
      const wantsStep = forcedResolveDirection !== 0 ? true : rng.bool(stepwiseBias)
      if (wantsStep) {
        let dir = forcedResolveDirection !== 0 ? forcedResolveDirection : rng.bool() ? 1 : -1
        let stepIdx = idx + dir
        if (stepIdx < 0 || stepIdx >= pool.length) {
          dir = -dir as 1 | -1
          stepIdx = idx + dir
        }
        // Occasionally allow a two-scale-step move so lines don't feel glued to neighbors.
        if (forcedResolveDirection === 0 && rng.bool(0.25)) {
          const twoIdx = idx + dir * 2
          if (twoIdx >= 0 && twoIdx < pool.length) stepIdx = twoIdx
        }
        next = pool[Math.min(pool.length - 1, Math.max(0, stepIdx))]
        forcedResolveDirection = 0
      } else {
        const leapSemitones = rng.int(3, Math.max(3, maxLeapSemitones))
        const dir = rng.bool() ? 1 : -1
        const target = current + dir * leapSemitones
        next = nearestInPool(pool, Math.min(range.high, Math.max(range.low, target)))
        if (Math.abs(next - current) >= 6) forcedResolveDirection = next > current ? -1 : 1
      }
    }

    // Avoid three-in-a-row repeats.
    if (recent.length >= 2 && next === recent[recent.length - 1] && next === recent[recent.length - 2]) {
      const idx2 = pool.indexOf(next)
      const bump = idx2 + (rng.bool() ? 1 : -1)
      next = pool[Math.min(pool.length - 1, Math.max(0, bump))]
    }

    result.push(next)
    recent.push(next)
    current = next
  }

  return maybeAddChromaticPassingTones(result, key, range, accidentals, rng)
}

/** Post-pass: nudge a few interior notes to chromatic passing tones between two diatonic neighbors. */
function maybeAddChromaticPassingTones(
  sequence: number[],
  key: KeyDefinition,
  range: PitchRange,
  accidentals: AccidentalLevel,
  rng: Rng,
): number[] {
  const p = ACCIDENTAL_PROBABILITY[accidentals]
  if (p === 0 || sequence.length < 3) return sequence
  const raised = raisedLeadingTone(key)
  const out = [...sequence]
  for (let i = 1; i < out.length - 1; i++) {
    if (!rng.bool(p)) continue
    const prev = out[i - 1]
    const cur = out[i]
    const next = out[i + 1]
    const gapToNext = next - cur
    // Insert a chromatic step between cur and next if they're a whole step apart (fills the gap).
    if (Math.abs(gapToNext) === 2 && cur + Math.sign(gapToNext) >= range.low && cur + Math.sign(gapToNext) <= range.high) {
      out[i] = cur + Math.sign(gapToNext)
      continue
    }
    // Or raise the leading tone if this note sits on the natural 7th of a minor key.
    if (raised !== null && ((cur % 12) + 12) % 12 === (raised - 1 + 12) % 12 && next > cur && prev <= cur) {
      out[i] = cur + 1
    }
  }
  return out
}
