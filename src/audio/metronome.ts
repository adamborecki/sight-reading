import * as Tone from 'tone'

let loop: Tone.Loop | null = null
let clickSynth: Tone.Synth | null = null

function ensureClick(): Tone.Synth {
  if (!clickSynth) {
    clickSynth = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
    }).toDestination()
    clickSynth.volume.value = -12
  }
  return clickSynth
}

/** Starts a free-running metronome (independent of exercise playback). Returns a stop function. */
export function startMetronome(bpm: number, beatsPerMeasure: number, onBeat?: (beatIndex: number) => void): () => void {
  const click = ensureClick()
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
