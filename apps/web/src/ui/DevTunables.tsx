import { useEffect } from 'react'
import { useControls } from 'leva'
import type { Tunables } from '../types'
import { DEFAULT_TUNABLES } from '../types'

interface DevTunablesProps {
  onChange: (t: Tunables) => void
}

export function DevTunables({ onChange }: DevTunablesProps) {
  const values = useControls('Tracking', {
    smoothing: {
      value: DEFAULT_TUNABLES.smoothing,
      min: 0.05,
      max: 1,
      step: 0.05,
    },
    pinchThreshold: {
      value: DEFAULT_TUNABLES.pinchThreshold,
      min: 0.02,
      max: 0.12,
      step: 0.005,
    },
    deadZone: {
      value: DEFAULT_TUNABLES.deadZone,
      min: 0,
      max: 0.1,
      step: 0.005,
    },
  })

  useEffect(() => {
    onChange(values)
  }, [values, onChange])

  return null
}
