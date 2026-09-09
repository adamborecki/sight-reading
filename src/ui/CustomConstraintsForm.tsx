import type { GeneratorConstraints } from '../engine/types'
import { KEY_LIBRARY, NOTE_OPTIONS } from '../engine/theory'
import { SIMPLE_CELLS, COMPOUND_CELLS, parseTimeSignature } from '../engine/rhythm'
import { applyClef } from '../engine/presets'

interface Props {
  constraints: GeneratorConstraints
  onChange: (next: GeneratorConstraints) => void
}

const TIME_SIGNATURES = ['2/4', '3/4', '4/4', '6/8', '9/8', '12/8']

export default function CustomConstraintsForm({ constraints, onChange }: Props) {
  const meterType = parseTimeSignature(constraints.timeSignature).meterType
  const cellOptions = meterType === 'compound' ? COMPOUND_CELLS : SIMPLE_CELLS

  function set<K extends keyof GeneratorConstraints>(key: K, value: GeneratorConstraints[K]) {
    onChange({ ...constraints, [key]: value })
  }

  function toggleKey(id: string) {
    const has = constraints.keys.some((k) => k.id === id)
    const next = has ? constraints.keys.filter((k) => k.id !== id) : [...constraints.keys, KEY_LIBRARY.find((k) => k.id === id)!]
    set('keys', next)
  }

  function toggleCell(id: string) {
    const has = constraints.rhythm.cellIds.includes(id)
    const next = has ? constraints.rhythm.cellIds.filter((c) => c !== id) : [...constraints.rhythm.cellIds, id]
    set('rhythm', { ...constraints.rhythm, cellIds: next })
  }

  return (
    <div className="constraints-form">
      <div className="field-row">
        <label>
          Clef
          <select value={constraints.clef} onChange={(e) => onChange(applyClef(constraints, e.target.value as 'treble' | 'bass'))}>
            <option value="treble">Treble</option>
            <option value="bass">Bass</option>
          </select>
        </label>
        <label>
          Time signature
          <select value={constraints.timeSignature} onChange={(e) => set('timeSignature', e.target.value)}>
            {TIME_SIGNATURES.map((ts) => (
              <option key={ts} value={ts}>
                {ts}
              </option>
            ))}
          </select>
        </label>
        <label>
          Measures
          <input
            type="number"
            min={1}
            max={16}
            value={constraints.measures}
            onChange={(e) => set('measures', Number(e.target.value))}
          />
        </label>
        <label>
          Tempo (bpm)
          <input
            type="number"
            min={40}
            max={200}
            value={constraints.tempoBpm}
            onChange={(e) => set('tempoBpm', Number(e.target.value))}
          />
        </label>
      </div>

      <div className="field-row">
        <label>
          Range low
          <select
            value={constraints.range.low}
            onChange={(e) => set('range', { ...constraints.range, low: Number(e.target.value) })}
          >
            {NOTE_OPTIONS.map((n) => (
              <option key={n.midi} value={n.midi}>
                {n.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Range high
          <select
            value={constraints.range.high}
            onChange={(e) => set('range', { ...constraints.range, high: Number(e.target.value) })}
          >
            {NOTE_OPTIONS.map((n) => (
              <option key={n.midi} value={n.midi}>
                {n.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Max leap (semitones)
          <input
            type="number"
            min={0}
            max={24}
            value={constraints.maxLeapSemitones}
            onChange={(e) => set('maxLeapSemitones', Number(e.target.value))}
          />
        </label>
        <label>
          Stepwise bias
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={constraints.stepwiseBias}
            onChange={(e) => set('stepwiseBias', Number(e.target.value))}
          />
        </label>
      </div>

      <div className="field-row">
        <label>
          Accidentals
          <select value={constraints.accidentals} onChange={(e) => set('accidentals', e.target.value as GeneratorConstraints['accidentals'])}>
            <option value="none">None</option>
            <option value="occasional">Occasional</option>
            <option value="frequent">Frequent</option>
          </select>
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={constraints.rhythm.allowRests}
            onChange={(e) => set('rhythm', { ...constraints.rhythm, allowRests: e.target.checked })}
          />
          Allow rests
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={constraints.dynamics} onChange={(e) => set('dynamics', e.target.checked)} />
          Dynamics
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={constraints.articulations} onChange={(e) => set('articulations', e.target.checked)} />
          Articulations
        </label>
      </div>

      <fieldset>
        <legend>Keys ({constraints.keys.length} selected)</legend>
        <div className="key-grid">
          {KEY_LIBRARY.map((k) => (
            <label key={k.id} className="checkbox">
              <input type="checkbox" checked={constraints.keys.some((x) => x.id === k.id)} onChange={() => toggleKey(k.id)} />
              {k.tonicName} {k.mode}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Rhythms ({constraints.rhythm.cellIds.length} selected)</legend>
        <div className="key-grid">
          {cellOptions.map((c) => (
            <label key={c.id} className="checkbox">
              <input type="checkbox" checked={constraints.rhythm.cellIds.includes(c.id)} onChange={() => toggleCell(c.id)} />
              {c.label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}
