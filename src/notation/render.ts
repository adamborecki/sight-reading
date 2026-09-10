import {
  Accidental,
  Annotation,
  AnnotationVerticalJustify,
  Articulation,
  Beam,
  Dot,
  Formatter,
  Renderer,
  RendererBackends,
  Stave,
  StaveNote,
  Voice,
  VoiceMode,
} from 'vexflow'
import type { GeneratedExercise, GeneratedNote } from '../engine/types'
import { midiToNoteName, scaleDegreeLabel, type NoteLabelMode } from '../engine/theory'
import { parseTimeSignature } from '../engine/rhythm'

const MEASURES_PER_ROW = 4
const FIRST_MEASURE_WIDTH = 260
const PLAIN_MEASURE_WIDTH = 190
const ROW_HEIGHT = 140
const TOP_MARGIN = 20
const LEFT_MARGIN = 10

const REST_KEY_BY_CLEF: Record<string, string> = { treble: 'b/4', bass: 'd/3' }

const ARTICULATION_CODE: Record<string, string> = { staccato: 'a.', accent: 'a>', tenuto: 'a-' }

export interface NoteBox {
  x: number
  y: number
  w: number
  h: number
}

export interface RenderResult {
  noteBoxes: Map<string, NoteBox>
  /** One box per measure, in exercise order, generous enough to cover stems/beams for "hide" overlays. */
  measureBoxes: NoteBox[]
  width: number
  height: number
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

export function renderExercise(
  container: HTMLDivElement,
  exercise: GeneratedExercise,
  labelMode: NoteLabelMode = 'none',
): RenderResult {
  container.innerHTML = ''
  const rows = chunk(exercise.measures, MEASURES_PER_ROW)
  const timeSig = parseTimeSignature(exercise.timeSignature)

  const rowWidths = rows.map((row, rowIndex) =>
    row.reduce((sum, _m, i) => sum + measureWidth(rowIndex, i), 0),
  )
  const width = LEFT_MARGIN * 2 + Math.max(...rowWidths, 400)
  const height = TOP_MARGIN + rows.length * ROW_HEIGHT + 20

  const renderer = new Renderer(container, RendererBackends.SVG)
  renderer.resize(width, height)
  const context = renderer.getContext()

  const noteBoxes = new Map<string, NoteBox>()
  const measureBoxes: NoteBox[] = []
  let globalMeasureIndex = 0

  rows.forEach((row, rowIndex) => {
    let x = LEFT_MARGIN
    const y = TOP_MARGIN + rowIndex * ROW_HEIGHT
    row.forEach((measureNotes, indexInRow) => {
      const isVeryFirst = globalMeasureIndex === 0
      const isFirstInRow = indexInRow === 0
      const w = measureWidth(rowIndex, indexInRow)
      const stave = new Stave(x, y, w)
      if (isFirstInRow) {
        stave.addClef(exercise.clef)
        stave.addKeySignature(exercise.key.vexKey)
      }
      if (isVeryFirst) {
        stave.addTimeSignature(exercise.timeSignature)
      }
      stave.setContext(context).draw()

      const staveNotes = measureNotes.map((n) => buildStaveNote(n, exercise, labelMode))
      const dotted = staveNotes.filter((_, i) => measureNotes[i].dots > 0)
      if (dotted.length > 0) Dot.buildAndAttach(dotted, { all: true })

      // Must run before voice.draw(): generating beams marks each note as beamed, which is what
      // tells StemmableNote to skip drawing its own flag. Doing this after draw() left every
      // beamed note rendering both an individual flag AND the beam on top of it.
      const beams = Beam.generateBeams(staveNotes, { groups: Beam.getDefaultBeamGroups(exercise.timeSignature) })

      const voice = new Voice({ numBeats: timeSig.numerator, beatValue: timeSig.denominator }).setMode(VoiceMode.SOFT)
      voice.addTickables(staveNotes)

      new Formatter().joinVoices([voice]).format([voice], w - (isFirstInRow ? 90 : 20))
      voice.setStave(stave)
      voice.draw(context, stave)

      beams.forEach((b) => b.setContext(context).draw())

      // Use absolute X + tick width rather than getBoundingBox(), which (for beamed notes in
      // particular) can report a box that grows across the whole beam group instead of just
      // this note. A full-height column over the note is also an easier cursor to track visually.
      staveNotes.forEach((sn, i) => {
        const noteX = sn.getAbsoluteX()
        const noteW = Math.max(sn.getWidth(), 14)
        noteBoxes.set(measureNotes[i].id, { x: noteX - 5, y: y + 4, w: noteW + 10, h: ROW_HEIGHT - 30 })
      })

      measureBoxes.push({ x, y, w, h: ROW_HEIGHT })

      x += w
      globalMeasureIndex += 1
    })
  })

  return { noteBoxes, measureBoxes, width, height }
}

function measureWidth(rowIndex: number, indexInRow: number): number {
  if (rowIndex === 0 && indexInRow === 0) return FIRST_MEASURE_WIDTH
  if (indexInRow === 0) return FIRST_MEASURE_WIDTH - 40
  return PLAIN_MEASURE_WIDTH
}

function buildStaveNote(note: GeneratedNote, exercise: GeneratedExercise, labelMode: NoteLabelMode): StaveNote {
  const keys = note.isRest
    ? [REST_KEY_BY_CLEF[exercise.clef] ?? 'b/4']
    : [midiToNoteName(note.midi as number, exercise.key).vexKey]

  const staveNote = new StaveNote({
    keys,
    duration: note.isRest ? `${note.dur}r` : note.dur,
    dots: note.dots,
    clef: exercise.clef,
  })

  if (!note.isRest && note.accidental) {
    staveNote.addModifier(new Accidental(note.accidental))
  }
  if (note.articulation) {
    const code = ARTICULATION_CODE[note.articulation]
    staveNote.addModifier(new Articulation(code).setPosition(3))
  }
  if (note.dynamic) {
    const ann = new Annotation(note.dynamic).setFont('Times', 12, 'italic')
    ann.setVerticalJustification(AnnotationVerticalJustify.BOTTOM)
    staveNote.addModifier(ann)
  }
  if (!note.isRest && labelMode !== 'none') {
    const label = scaleDegreeLabel(note.midi as number, exercise.key, labelMode)
    const ann = new Annotation(label).setFont('Arial', 10, '')
    ann.setVerticalJustification(AnnotationVerticalJustify.TOP)
    staveNote.addModifier(ann)
  }

  return staveNote
}
