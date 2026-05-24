import { useEffect, useRef, useState } from 'react'
import type { CalibrationData, HandSide } from '../../types'
import { CALIBRATION_VERSION } from '../../types'
import { isValidCalibration } from '../../calibration/mapToCanvas'

const DURATION_MS = 5000

interface CalibrateStepProps {
  hand: HandSide
  sampleIndexTip: () => { x: number; y: number } | null
  handDetected: boolean
  onComplete: (data: CalibrationData) => void
}

export function CalibrateStep({
  hand,
  sampleIndexTip,
  handDetected,
  onComplete,
}: CalibrateStepProps) {
  const [progress, setProgress] = useState(0)
  const [failed, setFailed] = useState(false)
  const boundsRef = useRef<{
    minX: number
    maxX: number
    minY: number
    maxY: number
  } | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    boundsRef.current = null
    setFailed(false)
    const start = performance.now()
    let frame = 0

    const tick = () => {
      const elapsed = performance.now() - start
      setProgress(Math.min(1, elapsed / DURATION_MS))

      const tip = sampleIndexTip()
      if (tip) {
        const b = boundsRef.current
        if (!b) {
          boundsRef.current = {
            minX: tip.x,
            maxX: tip.x,
            minY: tip.y,
            maxY: tip.y,
          }
        } else {
          boundsRef.current = {
            minX: Math.min(b.minX, tip.x),
            maxX: Math.max(b.maxX, tip.x),
            minY: Math.min(b.minY, tip.y),
            maxY: Math.max(b.maxY, tip.y),
          }
        }
      }

      if (elapsed < DURATION_MS) {
        frame = requestAnimationFrame(tick)
      } else {
        const final = boundsRef.current
        if (final) {
            const data: CalibrationData = {
              version: CALIBRATION_VERSION,
              hand,
              ...final,
            }
          if (isValidCalibration(data)) {
            onCompleteRef.current(data)
          } else {
            setFailed(true)
          }
        } else {
          setFailed(true)
        }
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [hand, sampleIndexTip])

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 p-8 text-center">
      <h2 className="text-2xl font-semibold tracking-wide text-white">
        Calibrate
      </h2>
      <p className="max-w-md text-slate-400">
        Move your index finger inside the guide box on the video for{' '}
        {DURATION_MS / 1000} seconds.
      </p>
      <div className="h-2 w-64 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      {!handDetected && progress < 1 && (
        <p className="text-sm text-amber-400">
          Move into the light — Active Hand not detected.
        </p>
      )}
      {failed && (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full border border-violet-500/40 px-6 py-2 text-sm text-violet-300 hover:bg-violet-500/10"
        >
          Range too small — try again
        </button>
      )}
    </div>
  )
}
