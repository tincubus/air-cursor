import type { NormalizedPoint } from '../types'

/** Match CSS `scaleX(-1)` on the webcam — same space as what the user sees. */
export function mirrorNormalizedPoint(p: NormalizedPoint): NormalizedPoint {
  return { x: 1 - p.x, y: p.y }
}

export function mirrorLandmarks(landmarks: NormalizedPoint[]): NormalizedPoint[] {
  return landmarks.map(mirrorNormalizedPoint)
}
