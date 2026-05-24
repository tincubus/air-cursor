import type { HandSide } from '../../types'

interface HandPickStepProps {
  onSelect: (hand: HandSide) => void
}

export function HandPickStep({ onSelect }: HandPickStepProps) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-8 p-8 text-center">
      <h2 className="text-2xl font-semibold tracking-wide text-white">
        Choose your Active Hand
      </h2>
      <p className="max-w-md text-slate-400">
        Only this hand will control the Interaction Canvas.
      </p>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => onSelect('left')}
          className="glass-panel rounded-2xl px-10 py-6 text-lg font-medium transition hover:border-violet-400/50 hover:shadow-[0_0_24px_#a78bfa44]"
        >
          Left hand
        </button>
        <button
          type="button"
          onClick={() => onSelect('right')}
          className="glass-panel rounded-2xl px-10 py-6 text-lg font-medium transition hover:border-violet-400/50 hover:shadow-[0_0_24px_#a78bfa44]"
        >
          Right hand
        </button>
      </div>
    </div>
  )
}
