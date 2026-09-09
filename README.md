# Sight Reading

A procedural sight-reading/sight-singing exercise generator and practice tool. Generates new
notation on demand from musical/pedagogical constraints, rather than pulling from a fixed
question bank.

This is an MVP: single-line melodic exercises (no ensembles yet), local-only persistence
(nothing leaves your device), and no auto-grading. See "Roadmap" below for what's next.

## Features

- **Procedural generation** — a rhythm-cell tiler + a stepwise-biased pitch walk generate new
  exercises every time, following conventional voice-leading (leap resolution, cadencing on the
  tonic, avoiding excessive repetition).
- **5 difficulty presets** (Level 1–5), plus a **custom constraint builder** (clef, keys, time
  signature, measures, range, max leap, accidentals, rests, dynamics, articulations, tempo,
  rhythm vocabulary).
- **Notation rendering** via VexFlow, with a moving playback cursor, "disappearing measures"
  reading mode, and printable output.
- **Playback** via Tone.js — tempo control, metronome, count-in.
- **Self-review recording** — record yourself against the generated score (mic stays local),
  play it back, and save it to a local practice log (IndexedDB). No submission/grading yet.

## Stack

- Vite + React + TypeScript
- [VexFlow](https://github.com/vexflow/vexflow) 5 for notation
- [Tone.js](https://tonejs.github.io/) 15 for audio
- No backend — everything runs client-side; recordings and practice logs live in the browser's
  IndexedDB and never leave the device.

> This repo pins `@vitejs/plugin-react` to the 4.x line and `vite` to 6.x for Node 18
> compatibility. If you're on Node 20.19+/22.12+, you can upgrade both to their latest majors.

## Development

```bash
npm install
npm run dev
```

## Build & deploy

```bash
npm run build
```

`vite.config.ts` sets `base: '/sight-reading/'` for the production build, matching a GitHub
Pages **project site** at `https://<username>.github.io/sight-reading/`. A GitHub Actions
workflow (`.github/workflows/deploy.yml`) builds and deploys to Pages on every push to `main` —
just enable Pages in the repo settings with source "GitHub Actions".

Alternatively, deploy manually with `npm run deploy` (uses `gh-pages` to push `dist/` to the
`gh-pages` branch).

## Architecture

```
src/engine/       Pure TS generation engine (theory, rhythm, pitch, presets) — no UI/audio deps
src/notation/      VexFlow rendering
src/audio/         Tone.js playback + metronome
src/recording/     MediaRecorder wrapper + IndexedDB practice log
src/ui/            React components
```

The engine is deliberately framework-agnostic so it can be reused (e.g. for a future ensemble
generator, or a headless test suite) without pulling in React/VexFlow/Tone.

## Roadmap (not in this MVP)

- Auto-assessment (pitch/rhythm grading against the recording)
- Class management / assignments / teacher-student accounts (needs a backend — Firebase/Supabase
  are the likely candidates, deployed alongside the still-static frontend)
- Ensemble generation (multi-part, per-student difficulty) and Live Practice sync
- More instrument contexts (currently single melodic line, treble/bass clef only)
