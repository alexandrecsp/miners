import { create } from 'zustand'

/** The Scene's tunable look. Fixed in production; Dev Tools edit it live in development. */
export interface Look {
  bloomIntensity: number
  bloomThreshold: number
  fogNear: number
  fogFar: number
  keyIntensity: number
  environmentIntensity: number
}

export const DEFAULT_LOOK: Look = {
  bloomIntensity: 0.9,
  bloomThreshold: 0.8,
  fogNear: 110,
  fogFar: 190,
  keyIntensity: 1.6,
  environmentIntensity: 1,
}

export const useLookStore = create<Look>(() => DEFAULT_LOOK)
