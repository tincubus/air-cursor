import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult,
} from '@mediapipe/tasks-vision'
import type { NormalizedPoint } from '../types'

const WASM_BASE =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'

let landmarker: HandLandmarker | null = null
let initPromise: Promise<HandLandmarker> | null = null

async function createLandmarker(delegate: 'GPU' | 'CPU'): Promise<HandLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(WASM_BASE)
  return HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MODEL_URL,
      delegate,
    },
    runningMode: 'VIDEO',
    numHands: 2,
  })
}

export async function getHandLandmarker(): Promise<HandLandmarker> {
  if (landmarker) return landmarker
  if (!initPromise) {
    initPromise = (async () => {
      try {
        landmarker = await createLandmarker('GPU')
      } catch {
        landmarker = await createLandmarker('CPU')
      }
      return landmarker
    })()
  }
  return initPromise
}

export function parseResult(result: HandLandmarkerResult): {
  landmarksList: NormalizedPoint[][]
  handednessList: string[]
} {
  const landmarksList: NormalizedPoint[][] = []
  const handednessList: string[] = []

  if (!result.landmarks?.length) {
    return { landmarksList, handednessList }
  }

  for (let i = 0; i < result.landmarks.length; i++) {
    const lm = result.landmarks[i]!
    landmarksList.push(lm.map((p) => ({ x: p.x, y: p.y })))
    const label = result.handednesses?.[i]?.[0]?.categoryName ?? 'Unknown'
    handednessList.push(label)
  }

  return { landmarksList, handednessList }
}
