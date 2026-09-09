import { useState } from 'react'
import type { GeneratorConstraints } from '../engine/types'
import { DIFFICULTY_PRESETS } from '../engine/presets'
import CustomConstraintsForm from './CustomConstraintsForm'

interface Props {
  constraints: GeneratorConstraints
  onConstraintsChange: (next: GeneratorConstraints) => void
  onSelectPreset: (presetId: string) => void
  selectedPresetId: string | null
  onGenerate: () => void
}

export default function GeneratorPanel({ constraints, onConstraintsChange, onSelectPreset, selectedPresetId, onGenerate }: Props) {
  const [customOpen, setCustomOpen] = useState(false)

  return (
    <section className="panel generator-panel">
      <h2>Generate an exercise</h2>
      <div className="preset-list">
        {DIFFICULTY_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`preset-card ${selectedPresetId === p.id ? 'selected' : ''}`}
            onClick={() => onSelectPreset(p.id)}
            title={p.description}
          >
            {p.name}
          </button>
        ))}
      </div>

      <button type="button" className="link-button" onClick={() => setCustomOpen((v) => !v)}>
        {customOpen ? 'Hide custom constraints' : 'Customize constraints…'}
      </button>

      {customOpen && <CustomConstraintsForm constraints={constraints} onChange={onConstraintsChange} />}

      <button type="button" className="primary generate-button" onClick={onGenerate}>
        🎼 Generate exercise
      </button>
    </section>
  )
}
