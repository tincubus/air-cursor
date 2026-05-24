# ADR 0001: Client-side MediaPipe Hand Landmarker

## Status

Accepted

## Context

Air Cursor needs real-time hand tracking in a browser demo. Video must stay on the device. We need 21 landmarks per hand, handedness, and acceptable latency on a laptop webcam.

## Decision

Use `@mediapipe/tasks-vision` **Hand Landmarker** running entirely in the browser (WASM + optional GPU delegate). Load model assets from the official MediaPipe CDN.

## Consequences

**Positive**

- No backend or video upload
- Low latency for a local demo
- Handedness and 21-point skeleton out of the box

**Negative**

- Tied to MediaPipe Tasks API and asset URLs
- Safari and GPU delegate quirks require explicit testing
- Harder to swap for a custom model later without a new ADR

## Alternatives considered

- **Python + OpenCV/MediaPipe server**: better for R&D, worse for a self-contained web demo and privacy story
- **Custom TensorFlow.js model**: more control, requires data collection and training
