import type { NormalizedPoint } from '../types'

export function smoothPoint(
  prev: NormalizedPoint | null,
  next: NormalizedPoint,
  alpha: number,
): NormalizedPoint {
  if (!prev) return next
  return {
    x: prev.x + alpha * (next.x - prev.x),
    y: prev.y + alpha * (next.y - prev.y),
  }
}
