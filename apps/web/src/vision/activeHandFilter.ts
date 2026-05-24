import type { HandSide, NormalizedPoint } from '../types'

const INDEX_TIP = 8

export function mediapipeHandToSide(categoryName: string): HandSide | null {
  const lower = categoryName.toLowerCase()
  if (lower.includes('left')) return 'left'
  if (lower.includes('right')) return 'right'
  return null
}

export function pickActiveHand(
  landmarksList: NormalizedPoint[][],
  handednessList: string[],
  activeHand: HandSide,
): NormalizedPoint[] | null {
  for (let i = 0; i < landmarksList.length; i++) {
    const side = mediapipeHandToSide(handednessList[i] ?? '')
    if (side === activeHand) return landmarksList[i] ?? null
  }
  return null
}

export function getIndexTip(landmarks: NormalizedPoint[]): NormalizedPoint {
  return landmarks[INDEX_TIP]!
}

export function getThumbTip(landmarks: NormalizedPoint[]): NormalizedPoint {
  return landmarks[4]!
}

export function pinchDistance(
  a: NormalizedPoint,
  b: NormalizedPoint,
): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.hypot(dx, dy)
}
