export type HandSide = 'left' | 'right'

export const CALIBRATION_VERSION = 2

export interface CalibrationData {
  version: number
  hand: HandSide
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export interface NormalizedPoint {
  x: number
  y: number
}

export interface CanvasPoint {
  x: number
  y: number
}

export interface HandFrame {
  landmarks: NormalizedPoint[]
  handedness: HandSide
}

export interface TrackingState {
  hand: HandFrame | null
  aimNormalized: NormalizedPoint | null
  pinchDistance: number | null
  fps: number
}

export interface Tunables {
  smoothing: number
  pinchThreshold: number
  deadZone: number
}

export const DEFAULT_TUNABLES: Tunables = {
  smoothing: 0.35,
  pinchThreshold: 0.045,
  deadZone: 0.02,
}

export type OnboardingStep =
  | 'permission'
  | 'hand-pick'
  | 'calibrate'
  | 'ready'

export type PinchPhase = 'open' | 'closing' | 'down' | 'hold' | 'up'
