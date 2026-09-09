import * as Tone from 'tone'

let melodySynth: Tone.PolySynth<Tone.Synth> | null = null
let clickSynth: Tone.Synth | null = null

export function getMelodySynth(): Tone.PolySynth<Tone.Synth> {
  if (!melodySynth) {
    melodySynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.6, release: 0.3 },
    }).toDestination()
  }
  return melodySynth
}

export function getClickSynth(): Tone.Synth {
  if (!clickSynth) {
    clickSynth = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
    }).toDestination()
    clickSynth.volume.value = -12
  }
  return clickSynth
}

/** Must be called from a user gesture (e.g. a click handler) before any audio plays. */
export async function unlockAudio(): Promise<void> {
  await Tone.start()
}
