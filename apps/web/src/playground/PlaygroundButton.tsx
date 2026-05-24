import { motion } from 'motion/react'

interface PlaygroundButtonProps {
  label: string
  x: number
  y: number
  size: number
  hovered: boolean
  clicked: boolean
  pressCount: number
}

export function PlaygroundButton({
  label,
  x,
  y,
  size,
  hovered,
  clicked,
  pressCount,
}: PlaygroundButtonProps) {
  return (
    <motion.div
      className="absolute flex items-center justify-center rounded-full border border-white/15 bg-slate-900/60 font-medium text-white shadow-lg"
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
      }}
      animate={{
        scale: clicked ? 0.92 : hovered ? 1.08 : 1,
        boxShadow: hovered
          ? '0 0 28px rgba(167, 139, 250, 0.55)'
          : '0 4px 24px rgba(0,0,0,0.35)',
        borderColor: hovered ? 'rgba(167, 139, 250, 0.6)' : 'rgba(255,255,255,0.12)',
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <span className="text-center text-sm leading-tight">
        {label}
        {pressCount > 0 && (
          <span className="mt-0.5 block text-xs text-cyan-400">{pressCount}</span>
        )}
      </span>
      {clicked && (
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-violet-400"
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      )}
    </motion.div>
  )
}
