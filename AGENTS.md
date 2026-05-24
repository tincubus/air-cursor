# Air Cursor — Agent Instructions

## Project

Browser demo: webcam **Tracking Panel** (left) + **Interaction Canvas** (right). **Aim Point** from index fingertip (absolute, Wacom-style after **Calibration**). **Pinch** = click; pinch hold = drag. See [CONTEXT.md](./CONTEXT.md) for domain terms.

## Stack

- `apps/web` — Vite, React, TypeScript, Tailwind v4, Motion, `@mediapipe/tasks-vision`
- Technical doc: [docs/technical-overview.md](./docs/technical-overview.md)
- Model reference: [docs/hand-landmarker-model.md](./docs/hand-landmarker-model.md)
- ADR: [docs/adr/0001-client-side-mediapipe-hands.md](./docs/adr/0001-client-side-mediapipe-hands.md)

## Conventions

- Do not add Electron, OS-level cursor control, or voice in MVP scope
- **Aim Point** only on **Interaction Canvas**; video mirror is display-only (CSS), mapping uses raw MediaPipe coordinates
- Prefer tracer-bullet phases with explicit verify steps

## Coding guidelines

Follow [kapathy-guidelines.md](./kapathy-guidelines.md).
