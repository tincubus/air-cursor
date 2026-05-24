import { useCallback, useEffect, useRef, useState } from 'react'

const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  facingMode: 'user',
  width: { ideal: 1280 },
  height: { ideal: 720 },
}

export interface UseWebcamResult {
  videoRef: React.RefCallback<HTMLVideoElement | null>
  videoElementRef: React.RefObject<HTMLVideoElement | null>
  stream: MediaStream | null
  error: string | null
  requestAccess: () => Promise<void>
  isReady: boolean
}

export function useWebcam(): UseWebcamResult {
  const streamRef = useRef<MediaStream | null>(null)
  const videoElRef = useRef<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  const attachToVideo = useCallback(async (video: HTMLVideoElement | null) => {
    const media = streamRef.current
    if (!video || !media) return

    if (video.srcObject !== media) {
      video.srcObject = media
    }

    try {
      await video.play()
    } catch {
      // Stream is still valid for MediaPipe; play can fail before an element is visible.
    }
  }, [])

  const videoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      videoElRef.current = node
      if (node && streamRef.current) {
        void attachToVideo(node)
      }
    },
    [attachToVideo],
  )

  const requestAccess = useCallback(async () => {
    setError(null)
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: VIDEO_CONSTRAINTS,
        audio: false,
      })
      streamRef.current = media
      setStream(media)
      setIsReady(true)
      await attachToVideo(videoElRef.current)
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Camera permission denied'
      setError(msg)
      setIsReady(false)
    }
  }, [attachToVideo])

  // Resume silently when the browser already granted camera for this site.
  useEffect(() => {
    let cancelled = false

    const tryAutoStart = async () => {
      if (streamRef.current) return

      try {
        const status = await navigator.permissions.query({
          name: 'camera' as PermissionName,
        })
        if (cancelled || status.state !== 'granted') return
        await requestAccess()
      } catch {
        // permissions.query unsupported — user taps Enable webcam
      }
    }

    void tryAutoStart()
    return () => {
      cancelled = true
    }
  }, [requestAccess])

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  return {
    videoRef,
    videoElementRef: videoElRef,
    stream,
    error,
    requestAccess,
    isReady,
  }
}
