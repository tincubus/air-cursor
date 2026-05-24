import type { CalibrationData, HandSide } from '../types'
import { CALIBRATION_VERSION } from '../types'

const KEY = 'air-cursor-calibration'

export function loadCalibration(): CalibrationData | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as CalibrationData
    if (
      (data.hand !== 'left' && data.hand !== 'right') ||
      typeof data.minX !== 'number' ||
      data.version !== CALIBRATION_VERSION
    ) {
      return null
    }
    return data
  } catch {
    return null
  }
}

export function saveCalibration(data: CalibrationData): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function clearCalibration(): void {
  localStorage.removeItem(KEY)
}

export function handSideLabel(hand: HandSide): string {
  return hand === 'left' ? 'Left' : 'Right'
}
