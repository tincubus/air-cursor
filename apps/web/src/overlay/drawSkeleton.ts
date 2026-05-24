import type { NormalizedPoint } from '../types'

const CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [5, 9],
  [9, 13],
  [13, 17],
]

export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedPoint[],
  width: number,
  height: number,
): void {
  ctx.clearRect(0, 0, width, height)

  const toPx = (p: NormalizedPoint) => ({
    x: p.x * width,
    y: p.y * height,
  })

  ctx.strokeStyle = '#22d3ee'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'

  for (const [a, b] of CONNECTIONS) {
    const p1 = toPx(landmarks[a]!)
    const p2 = toPx(landmarks[b]!)
    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.stroke()
  }

  for (let i = 0; i < landmarks.length; i++) {
    const { x, y } = toPx(landmarks[i]!)
    const isTip = i === 8
    ctx.beginPath()
    ctx.arc(x, y, isTip ? 6 : 3, 0, Math.PI * 2)
    ctx.fillStyle = isTip ? '#a78bfa' : '#22d3ee'
    if (isTip) {
      ctx.shadowColor = '#a78bfa'
      ctx.shadowBlur = 12
    }
    ctx.fill()
    ctx.shadowBlur = 0
  }
}
