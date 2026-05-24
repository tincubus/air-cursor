# Air Cursor Web Demo

Browser demo: webcam hand tracking controls an on-screen Aim Point via pinch gestures.

## Run

```bash
npm install
npm run dev
```

Open the URL shown (HTTPS or localhost required for camera access).

## Build

```bash
npm run build
npm run preview
```

## Browsers

Tested target: Chrome and Safari on macOS. MediaPipe loads WASM from CDN; first launch downloads the hand model.
