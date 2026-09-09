import { useEffect, useRef, useState } from 'react'
import type { GeneratedExercise } from '../engine/types'
import { renderExercise, type RenderResult } from '../notation/render'

interface Props {
  exercise: GeneratedExercise
  cursorNoteId: string | null
  hiddenMeasures: ReadonlySet<number>
}

export default function ScoreView({ exercise, cursorNoteId, hiddenMeasures }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [result, setResult] = useState<RenderResult | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    setResult(renderExercise(containerRef.current, exercise))
  }, [exercise])

  const cursorBox = cursorNoteId ? result?.noteBoxes.get(cursorNoteId) : null

  return (
    <div className="score-view" style={{ width: result?.width, height: result?.height }}>
      <div ref={containerRef} className="score-svg-host" />
      {cursorBox && (
        <div
          className="score-cursor"
          style={{ left: cursorBox.x - 4, top: cursorBox.y - 6, width: cursorBox.w + 8, height: cursorBox.h + 12 }}
        />
      )}
      {result &&
        [...hiddenMeasures].map((idx) => {
          const box = result.measureBoxes[idx]
          if (!box) return null
          return <div key={idx} className="score-measure-cover" style={{ left: box.x, top: box.y, width: box.w, height: box.h }} />
        })}
    </div>
  )
}
