import { Stats } from '@react-three/drei'
import { button, Leva, useControls } from 'leva'
import { useEffect } from 'react'
import { addCredits, refreshShopFree, setCondition, skipHours } from '../core/cheats'
import type { GameState } from '../core/types'
import { applyOfflineReplay, useGameStore } from '../store/gameStore'
import { useUiStore } from '../store/uiStore'
import { DEFAULT_LOOK, useLookStore } from '../scene/lookStore'
import type { Look } from '../scene/lookStore'

/** Runs a cheat over the Game State and stores the result. */
function applyCheat(cheat: (game: GameState) => GameState): void {
  useGameStore.setState((s) => ({ game: cheat(s.game) }))
}

/** The leva slider range of each Look setting; the starting value comes from DEFAULT_LOOK. */
const LOOK_RANGES: Record<keyof Look, { min: number; max: number; step: number }> = {
  bloomIntensity: { min: 0, max: 4, step: 0.05 },
  bloomThreshold: { min: 0, max: 1, step: 0.01 },
  fogNear: { min: 0, max: 300, step: 1 },
  fogFar: { min: 1, max: 400, step: 1 },
  keyIntensity: { min: 0, max: 5, step: 0.05 },
  environmentIntensity: { min: 0, max: 4, step: 0.05 },
}

const LOOK_CONTROLS = Object.fromEntries(
  (Object.keys(DEFAULT_LOOK) as (keyof Look)[]).map((name) => [name, { value: DEFAULT_LOOK[name], ...LOOK_RANGES[name] }]),
) as Record<keyof Look, { value: number; min: number; max: number; step: number }>

function LookPanel() {
  const look = useControls('Look', LOOK_CONTROLS)
  useEffect(() => {
    useLookStore.setState(look)
  }, [look])
  return null
}

function CheatsPanel() {
  useControls('Cheats', {
    credits: { value: 1000, min: 0, step: 100 },
    'Add Credits': button((get) => applyCheat((game) => addCredits(game, get('Cheats.credits')))),
    hours: { value: 2, min: 0, max: 24, step: 1 },
    'Skip hours': button((get) => applyOfflineReplay(skipHours(useGameStore.getState().game, get('Cheats.hours')))),
    'Free Shop Refresh': button(() => applyCheat(refreshShopFree)),
    condition: { value: 50, min: 0, max: 100, step: 1 },
    'Set selected Machine Condition': button((get) => {
      const id = useUiStore.getState().selectedMachineId
      if (id) applyCheat((game) => setCondition(game, id, get('Cheats.condition')))
    }),
  })
  return null
}

/** Development-only leva panels: live look tuning, cheats and the frame-rate overlay (drei Stats). Reached only through a dynamic import behind `import.meta.env.DEV`. */
export default function DevTools() {
  return (
    <>
      <Stats />
      <Leva collapsed />
      <LookPanel />
      <CheatsPanel />
    </>
  )
}
