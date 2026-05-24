interface VirtualPointerProps {
  x: number
  y: number
  visible: boolean
  pinching: boolean
}

export function VirtualPointer({ x, y, visible, pinching }: VirtualPointerProps) {
  if (!visible) return null

  return (
    <div
      className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-1/2"
      style={{ left: x, top: y }}
    >
      <div
        className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
          pinching
            ? 'border-violet-400 bg-violet-500/30 shadow-[0_0_20px_#a78bfa]'
            : 'border-cyan-400/80 bg-cyan-400/10 shadow-[0_0_12px_#22d3ee88]'
        }`}
      >
        <div className="absolute h-px w-5 bg-cyan-400/50" />
        <div className="absolute h-5 w-px bg-cyan-400/50" />
        <div className="h-1.5 w-1.5 rounded-full bg-white" />
      </div>
    </div>
  )
}
