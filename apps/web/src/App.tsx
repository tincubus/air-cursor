import { useCallback, useEffect, useRef, useState } from 'react'
import { useWebcam } from './camera/useWebcam'
import { loadCalibration, saveCalibration } from './calibration/storage'
import { mapToCanvas } from './calibration/mapToCanvas'
import { getHandLandmarker, parseResult } from './vision/handLandmarker'
import {
  getIndexTip,
  getThumbTip,
  pickActiveHand,
  pinchDistance,
} from './vision/activeHandFilter'
import { mirrorLandmarks } from './vision/mirrorSpace'
import { smoothPoint } from './vision/smooth'
import { PinchDetector } from './gestures/pinchDetector'
import { PermissionStep } from './ui/onboarding/PermissionStep'
import { HandPickStep } from './ui/onboarding/HandPickStep'
import { CalibrateStep } from './ui/onboarding/CalibrateStep'
import { TrackingPanel } from './ui/TrackingPanel'
import {
  InteractionCanvas,
  hitTestPlayground,
  type PlaygroundButtonConfig,
  type PlaygroundCardConfig,
} from './playground/InteractionCanvas'
import { DevTunables } from './ui/DevTunables'
import type {
  CalibrationData,
  CanvasPoint,
  HandSide,
  NormalizedPoint,
  OnboardingStep,
  Tunables,
} from './types'
import { DEFAULT_TUNABLES } from './types'

const INITIAL_BUTTONS: PlaygroundButtonConfig[] = [
  { id: 'b1', label: 'Launch', x: 100, y: 90, size: 72 },
  { id: 'b2', label: 'Scan', x: 220, y: 160, size: 64 },
  { id: 'b3', label: 'Sync', x: 140, y: 260, size: 68 },
  { id: 'b4', label: 'HUD', x: 280, y: 80, size: 56 },
]

const INITIAL_CARDS: PlaygroundCardConfig[] = [
  { id: 'c1', title: 'Alpha', x: 24, y: 140, width: 140, height: 100 },
  { id: 'c2', title: 'Beta', x: 200, y: 220, width: 150, height: 110 },
]

export default function App() {
  const storedCal = loadCalibration()
  const {
    videoRef,
    videoElementRef,
    stream,
    error: camError,
    requestAccess,
    isReady,
  } = useWebcam()
  const [cameraLoading, setCameraLoading] = useState(false)

  const handleRequestCamera = useCallback(async () => {
    setCameraLoading(true)
    await requestAccess()
    setCameraLoading(false)
  }, [requestAccess])

  const [onboarding, setOnboarding] = useState<OnboardingStep>('permission')
  const [activeHand, setActiveHand] = useState<HandSide>(
    storedCal?.hand ?? 'right',
  )
  const [calibration, setCalibration] = useState<CalibrationData | null>(
    storedCal,
  )
  const [tunables, setTunables] = useState<Tunables>(DEFAULT_TUNABLES)

  const [landmarks, setLandmarks] = useState<NormalizedPoint[] | null>(null)
  const [handDetected, setHandDetected] = useState(false)
  const [fps, setFps] = useState(0)
  const [aimPoint, setAimPoint] = useState<CanvasPoint | null>(null)
  const [pinching, setPinching] = useState(false)

  const [buttons] = useState(INITIAL_BUTTONS)
  const [cards, setCards] = useState(INITIAL_CARDS)
  const [buttonPressCounts, setButtonPressCounts] = useState<
    Record<string, number>
  >({})
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [clickedId, setClickedId] = useState<string | null>(null)
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null)

  const smoothRef = useRef<NormalizedPoint | null>(null)
  const pinchRef = useRef(new PinchDetector())
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const draggingCardIdRef = useRef<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const indexTipRef = useRef<NormalizedPoint | null>(null)
  const landmarkerReady = useRef(false)
  const lastVideoTime = useRef(-1)
  const cardsRef = useRef(cards)
  cardsRef.current = cards

  const sampleIndexTip = useCallback(() => indexTipRef.current, [])

  const advanceAfterCamera = useCallback(() => {
    const cal = loadCalibration()
    if (cal) {
      setCalibration(cal)
      setActiveHand(cal.hand)
      setOnboarding('ready')
    } else {
      setOnboarding('hand-pick')
    }
  }, [])

  useEffect(() => {
    if (onboarding === 'permission' && isReady) {
      advanceAfterCamera()
    }
  }, [isReady, onboarding, advanceAfterCamera])

  // Camera on but isReady missed — still leave permission step when stream exists.
  useEffect(() => {
    if (onboarding === 'permission' && stream && !isReady) {
      advanceAfterCamera()
    }
  }, [stream, isReady, onboarding, advanceAfterCamera])

  useEffect(() => {
    draggingCardIdRef.current = draggingCardId
  }, [draggingCardId])

  const handleHandPick = (hand: HandSide) => {
    setActiveHand(hand)
    setOnboarding('calibrate')
  }

  const handleCalibrateComplete = (data: CalibrationData) => {
    saveCalibration(data)
    setCalibration(data)
    setActiveHand(data.hand)
    setOnboarding('ready')
  }

  const handleRecalibrate = () => {
    pinchRef.current.reset()
    setDraggingCardId(null)
    setAimPoint(null)
    setOnboarding('calibrate')
  }

  const getCanvasSize = useCallback(() => {
    const el = canvasRef.current
    if (!el) return { width: 400, height: 400 }
    return { width: el.clientWidth, height: el.clientHeight }
  }, [])

  const trackingActive =
    isReady &&
    onboarding !== 'permission' &&
    onboarding !== 'hand-pick'

  useEffect(() => {
    if (!trackingActive) return

    let cancelled = false
    let raf = 0
    const fpsFrames: number[] = []

    const loop = async () => {
      if (cancelled) return

      const video = videoElementRef.current
      if (!video || video.readyState < 2) {
        raf = requestAnimationFrame(loop)
        return
      }

      try {
        if (!landmarkerReady.current) {
          await getHandLandmarker()
          landmarkerReady.current = true
        }

        const landmarker = await getHandLandmarker()
        const now = performance.now()
        if (video.currentTime !== lastVideoTime.current) {
          lastVideoTime.current = video.currentTime
          const result = landmarker.detectForVideo(video, now)
          const { landmarksList, handednessList } = parseResult(result)
          const activeLm = pickActiveHand(
            landmarksList,
            handednessList,
            activeHand,
          )

          if (activeLm) {
            const mirroredLm = mirrorLandmarks(activeLm)
            setLandmarks(mirroredLm)
            setHandDetected(true)
            const tip = getIndexTip(mirroredLm)
            smoothRef.current = smoothPoint(
              smoothRef.current,
              tip,
              tunables.smoothing,
            )
            indexTipRef.current = smoothRef.current

            const dist = pinchDistance(
              getThumbTip(mirroredLm),
              getIndexTip(mirroredLm),
            )
            const isPinch = dist < tunables.pinchThreshold
            setPinching(isPinch)

            const pinchEvent = pinchRef.current.update(isPinch, now)

            if (onboarding === 'ready' && calibration) {
              const { width, height } = getCanvasSize()
              const mapped = mapToCanvas(
                smoothRef.current,
                calibration,
                width,
                height,
                tunables,
              )
              setAimPoint(mapped)

              const hoverId = hitTestPlayground(mapped, buttons, cardsRef.current)
              setHoveredId(hoverId)

              if (pinchEvent.type === 'hold-start' && hoverId) {
                const card = cardsRef.current.find((c) => c.id === hoverId)
                if (card) {
                  setDraggingCardId(card.id)
                  dragOffsetRef.current = {
                    x: mapped.x - card.x,
                    y: mapped.y - card.y,
                  }
                }
              }

              if (pinchEvent.type === 'hold-end') {
                setDraggingCardId(null)
              }

              if (pinchEvent.type === 'click' && hoverId) {
                if (buttons.some((b) => b.id === hoverId)) {
                  setButtonPressCounts((prev) => ({
                    ...prev,
                    [hoverId]: (prev[hoverId] ?? 0) + 1,
                  }))
                  setClickedId(hoverId)
                  setTimeout(() => setClickedId(null), 400)
                }
              }

              const dragId = draggingCardIdRef.current
              if (
                dragId &&
                (pinchRef.current.phase === 'hold' ||
                  pinchRef.current.phase === 'down')
              ) {
                setCards((prev) =>
                  prev.map((c) =>
                    c.id === dragId
                      ? {
                          ...c,
                          x: Math.max(
                            0,
                            Math.min(
                              width - c.width,
                              mapped.x - dragOffsetRef.current.x,
                            ),
                          ),
                          y: Math.max(
                            0,
                            Math.min(
                              height - c.height,
                              mapped.y - dragOffsetRef.current.y,
                            ),
                          ),
                        }
                      : c,
                  ),
                )
              }
            } else {
              setAimPoint(null)
              setHoveredId(null)
            }
          } else {
            setLandmarks(null)
            setHandDetected(false)
            smoothRef.current = null
            indexTipRef.current = null
            setAimPoint(null)
            setHoveredId(null)
            setPinching(false)
          }

          fpsFrames.push(now)
          while (fpsFrames.length > 0 && fpsFrames[0]! < now - 1000) {
            fpsFrames.shift()
          }
          setFps(fpsFrames.length)
        }
      } catch {
        /* landmarker loading */
      }

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [
    trackingActive,
    onboarding,
    activeHand,
    calibration,
    tunables,
    videoElementRef,
    getCanvasSize,
    buttons,
  ])

  const showMain = onboarding === 'ready' && calibration !== null

  return (
    <div className="flex h-full flex-col bg-base">
      {import.meta.env.DEV && onboarding !== 'permission' && (
        <DevTunables onChange={setTunables} />
      )}

      <header className="flex shrink-0 items-center justify-between border-b border-white/5 px-5 py-3">
        <h1 className="text-lg font-semibold tracking-widest text-white">
          AIR CURSOR
        </h1>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          {showMain && (
            <button
              type="button"
              onClick={handleRecalibrate}
              className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wider transition hover:border-violet-400/40 hover:text-violet-300"
            >
              Recalibrate
            </button>
          )}
          <span className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${handDetected ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-slate-600'}`}
            />
            {handDetected ? 'Tracking' : 'No hand'}
          </span>
          <span className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${calibration ? 'bg-violet-400' : 'bg-slate-600'}`}
            />
            {calibration ? 'Calibrated' : 'Not calibrated'}
          </span>
          {import.meta.env.DEV && (
            <span className="tabular-nums text-slate-500">{fps} FPS</span>
          )}
        </div>
      </header>

      {onboarding === 'permission' && (
        <>
          <video
            ref={videoRef}
            className="pointer-events-none fixed h-px w-px opacity-0"
            playsInline
            muted
            autoPlay
          />
          <PermissionStep
            error={camError}
            loading={cameraLoading}
            waitingForBrowser={cameraLoading && !stream}
            cameraActive={Boolean(stream)}
            onRequest={handleRequestCamera}
            onContinue={advanceAfterCamera}
          />
        </>
      )}

      {onboarding === 'hand-pick' && (
        <>
          <video
            ref={videoRef}
            className="pointer-events-none fixed h-px w-px opacity-0"
            playsInline
            muted
            autoPlay
          />
          <HandPickStep onSelect={handleHandPick} />
        </>
      )}

      {onboarding === 'calibrate' && (
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div className="h-48 shrink-0 p-3 lg:h-auto lg:w-[42%] lg:p-4">
            <TrackingPanel
              videoRef={videoRef}
              landmarks={landmarks}
              showGuide
            />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <CalibrateStep
              hand={activeHand}
              sampleIndexTip={sampleIndexTip}
              handDetected={handDetected}
              onComplete={handleCalibrateComplete}
            />
          </div>
        </div>
      )}

      {showMain && (
        <main className="flex min-h-0 flex-1 flex-col gap-2 p-3 lg:flex-row lg:gap-4 lg:p-4">
          <section className="h-44 shrink-0 lg:h-auto lg:w-[42%]">
            <TrackingPanel
              videoRef={videoRef}
              landmarks={landmarks}
              showGuide={false}
            />
          </section>
          <section ref={canvasRef} className="min-h-0 flex-1">
            <InteractionCanvas
              aimPoint={aimPoint}
              pinching={pinching}
              buttons={buttons}
              cards={cards}
              buttonPressCounts={buttonPressCounts}
              hoveredId={hoveredId}
              clickedId={clickedId}
              draggingCardId={draggingCardId}
            />
          </section>
        </main>
      )}

      {showMain && (
        <footer className="shrink-0 border-t border-white/5 px-5 py-2 text-center text-xs text-slate-500">
          Point with your index finger · Pinch to click · Pinch and hold on a
          card to drag
        </footer>
      )}
    </div>
  )
}
