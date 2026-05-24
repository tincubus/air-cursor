import { useRef } from 'react'
import type { CanvasPoint } from '../types'
import { VirtualPointer } from '../ui/VirtualPointer'
import { PlaygroundButton } from './PlaygroundButton'
import { DraggableCard } from './DraggableCard'
import { findTargetAt, type HitTarget } from './hitTest'

export interface PlaygroundButtonConfig {
  id: string
  label: string
  x: number
  y: number
  size: number
}

export interface PlaygroundCardConfig {
  id: string
  title: string
  x: number
  y: number
  width: number
  height: number
}

interface InteractionCanvasProps {
  aimPoint: CanvasPoint | null
  pinching: boolean
  buttons: PlaygroundButtonConfig[]
  cards: PlaygroundCardConfig[]
  buttonPressCounts: Record<string, number>
  hoveredId: string | null
  clickedId: string | null
  draggingCardId: string | null
}

export function InteractionCanvas({
  aimPoint,
  pinching,
  buttons,
  cards,
  buttonPressCounts,
  hoveredId,
  clickedId,
  draggingCardId,
}: InteractionCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      className="relative h-full min-h-0 overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-base-elevated"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,#818cf822,transparent_50%)]" />

      {buttons.map((b) => (
        <PlaygroundButton
          key={b.id}
          label={b.label}
          x={b.x}
          y={b.y}
          size={b.size}
          hovered={hoveredId === b.id}
          clicked={clickedId === b.id}
          pressCount={buttonPressCounts[b.id] ?? 0}
        />
      ))}

      {cards.map((c) => (
        <DraggableCard
          key={c.id}
          title={c.title}
          x={c.x}
          y={c.y}
          width={c.width}
          height={c.height}
          hovered={hoveredId === c.id}
          dragging={draggingCardId === c.id}
        />
      ))}

      <VirtualPointer
        x={aimPoint?.x ?? 0}
        y={aimPoint?.y ?? 0}
        visible={aimPoint !== null}
        pinching={pinching}
      />
    </div>
  )
}

export function buildHitTargets(
  buttons: PlaygroundButtonConfig[],
  cards: PlaygroundCardConfig[],
): HitTarget[] {
  const targets: HitTarget[] = []
  for (const c of cards) {
    targets.push({
      id: c.id,
      x: c.x,
      y: c.y,
      width: c.width,
      height: c.height,
    })
  }
  for (const b of buttons) {
    targets.push({
      id: b.id,
      x: b.x - b.size / 2,
      y: b.y - b.size / 2,
      width: b.size,
      height: b.size,
    })
  }
  return targets
}

export function hitTestPlayground(
  point: CanvasPoint | null,
  buttons: PlaygroundButtonConfig[],
  cards: PlaygroundCardConfig[],
): string | null {
  if (!point) return null
  const target = findTargetAt(point, buildHitTargets(buttons, cards))
  return target?.id ?? null
}
