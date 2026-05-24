import { motion } from 'motion/react'

interface DraggableCardProps {
  title: string
  x: number
  y: number
  width: number
  height: number
  hovered: boolean
  dragging: boolean
}

export function DraggableCard({
  title,
  x,
  y,
  width,
  height,
  hovered,
  dragging,
}: DraggableCardProps) {
  return (
    <motion.div
      className="glass-panel absolute flex flex-col justify-end p-4"
      style={{ left: x, top: y, width, height }}
      animate={{
        scale: dragging ? 1.02 : hovered ? 1.03 : 1,
        boxShadow: dragging
          ? '0 12px 40px rgba(129, 140, 248, 0.35)'
          : hovered
            ? '0 8px 32px rgba(167, 139, 250, 0.25)'
            : '0 4px 20px rgba(0,0,0,0.3)',
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
    >
      <span className="text-xs uppercase tracking-widest text-slate-500">
        Glass card
      </span>
      <span className="text-lg font-medium text-white">{title}</span>
      {dragging && (
        <span className="mt-2 text-xs text-violet-300">Pinch to drag</span>
      )}
    </motion.div>
  )
}
