import type { CalibrationData, CanvasPoint, NormalizedPoint, Tunables } from '../types'

function applyDeadZone(value: number, deadZone: number): number {
  const center = 0.5
  const delta = value - center
  const abs = Math.abs(delta)
  if (abs < deadZone) return center
  const sign = delta < 0 ? -1 : 1
  const scaled = (abs - deadZone) / (0.5 - deadZone)
  return center + sign * scaled * 0.5
}

export function mapToCanvas(
  point: NormalizedPoint,
  calibration: CalibrationData,
  width: number,
  height: number,
  tunables: Pick<Tunables, 'deadZone'>,
): CanvasPoint {
  const rangeX = calibration.maxX - calibration.minX || 0.001
  const rangeY = calibration.maxY - calibration.minY || 0.001

  let nx = (point.x - calibration.minX) / rangeX
  let ny = (point.y - calibration.minY) / rangeY

  nx = applyDeadZone(nx, tunables.deadZone)
  ny = applyDeadZone(ny, tunables.deadZone)

  const x = Math.min(width, Math.max(0, nx * width))
  const y = Math.min(height, Math.max(0, ny * height))

  return { x, y }
}

export function isValidCalibration(cal: CalibrationData): boolean {
  const rangeX = cal.maxX - cal.minX
  const rangeY = cal.maxY - cal.minY
  return rangeX > 0.05 && rangeY > 0.05
}
