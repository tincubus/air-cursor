import { useEffect, useRef } from 'react'
import type { NormalizedPoint } from '../types'
import { drawSkeleton } from '../overlay/drawSkeleton'

interface TrackingPanelProps {
  videoRef: React.RefCallback<HTMLVideoElement | null>
  landmarks: NormalizedPoint[] | null
  showGuide: boolean
}

export function TrackingPanel({
  videoRef,
  landmarks,
  showGuide,
}: TrackingPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const localVideoRef = useRef<HTMLVideoElement | null>(null)

  const setVideoRef = (node: HTMLVideoElement | null) => {
    localVideoRef.current = node
    videoRef(node)
  }

  useEffect(() => {
    const video = localVideoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const syncSize = () => {
      const w = video.clientWidth
      const h = video.clientHeight
      if (w && h && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w
        canvas.height = h
      }
    }

    syncSize()
    const ro = new ResizeObserver(syncSize)
    ro.observe(video)

    return () => ro.disconnect()
  }, [landmarks])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (landmarks) {
      drawSkeleton(ctx, landmarks, canvas.width, canvas.height)
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [landmarks])

  return (
    <div className="relative h-full min-h-0 overflow-hidden rounded-2xl bg-black/40">
      <video
        ref={setVideoRef}
        className="h-full w-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
        playsInline
        muted
        autoPlay
      />
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      {showGuide && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <div className="h-[70%] w-[75%] rounded-2xl border-2 border-dashed border-cyan-400/50 shadow-[inset_0_0_40px_#22d3ee22]" />
        </div>
      )}
    </div>
  )
}
