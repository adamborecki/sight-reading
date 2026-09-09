import * as Tone from 'tone'
import { getClickSynth } from './synths'

let loop: Tone.Loop | null = null

/** Starts a free-running metronome (independent of exercise playback). Returns a stop function. */
export function startMetronome(bpm: number, beatsPerMeasure: number, onBeat?: (beatIndex: number) => void): () => void {
  const click = getClickSynth()
  const transport = Tone.getTransport()
  transport.bpm.value = bpm

  let beat = 0
  loop = new Tone.Loop((time) => {
    const pitch = beat % beatsPerMeasure === 0 ? 'C6' : 'G5'
    click.triggerAttackRelease(pitch, '32n', time)
    const b = beat % beatsPerMeasure
    if (onBeat) Tone.getDraw().schedule(() => onBeat(b), time)
    beat += 1
  }, '4n').start(0)

  transport.start()

  return () => {
    loop?.stop()
    loop?.dispose()
    loop = null
    Tone.getDraw().cancel(0)
    transport.stop()
    transport.cancel(0)
  }
}

/**
 * Plays a one-off count-in (e.g. before a recorded performance) using direct clock scheduling,
 * independent of the shared Transport. Resolves once the last click has sounded.
 */
export async function playCountIn(bpm: number, beats: number, onBeat?: (beatsRemaining: number) => void): Promise<void> {
  await Tone.start()
  const click = getClickSynth()
  const secondsPerBeat = 60 / bpm
  const base = Tone.now() + 0.05
  for (let b = 0; b < beats; b++) {
    const time = base + b * secondsPerBeat
    const pitch = b === 0 ? 'C6' : 'G5'
    click.triggerAttackRelease(pitch, '32n', time)
    if (onBeat) {
      const remaining = beats - b
      Tone.getDraw().schedule(() => onBeat(remaining), time)
    }
  }
  await new Promise((resolve) => setTimeout(resolve, beats * secondsPerBeat * 1000))
  onBeat?.(0)
}
