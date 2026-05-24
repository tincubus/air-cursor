import type { CanvasPoint } from '../types'

export interface HitTarget {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export function pointInRect(
  point: CanvasPoint,
  rect: { x: number; y: number; width: number; height: number },
): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  )
}

export function findTargetAt(
  point: CanvasPoint,
  targets: HitTarget[],
): HitTarget | null {
  for (let i = targets.length - 1; i >= 0; i--) {
    const t = targets[i]!
    if (pointInRect(point, t)) return t
  }
  return null
}
