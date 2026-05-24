import type { PinchPhase } from '../types'

const CLICK_MAX_MS = 300

export interface PinchEvent {
  type: 'click' | 'hold-start' | 'hold-end' | 'none'
}

export class PinchDetector {
  phase: PinchPhase = 'open'
  private downAt = 0
  private holdEmitted = false

  update(isPinching: boolean, now: number): PinchEvent {
    if (!isPinching) {
      if (this.phase === 'down') {
        const held = now - this.downAt
        this.phase = 'open'
        if (held < CLICK_MAX_MS) return { type: 'click' }
        return { type: 'none' }
      }
      if (this.phase === 'hold') {
        this.phase = 'open'
        this.holdEmitted = false
        return { type: 'hold-end' }
      }
      this.phase = 'open'
      return { type: 'none' }
    }

    if (this.phase === 'open') {
      this.phase = 'down'
      this.downAt = now
      this.holdEmitted = false
      return { type: 'none' }
    }

    if (this.phase === 'down' && now - this.downAt >= CLICK_MAX_MS) {
      this.phase = 'hold'
      if (!this.holdEmitted) {
        this.holdEmitted = true
        return { type: 'hold-start' }
      }
    }

    return { type: 'none' }
  }

  reset(): void {
    this.phase = 'open'
    this.downAt = 0
    this.holdEmitted = false
  }
}
