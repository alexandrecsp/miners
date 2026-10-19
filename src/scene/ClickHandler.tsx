import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { machineAt } from '../core/queries'
import { dispatch, useGameStore } from '../store/gameStore'
import { useUiStore } from '../store/uiStore'

const CLICK_THRESHOLD_PX = 4

/** Turns a click (not a drag) on the canvas into a Player Action or a selection. */
export function ClickHandler() {
  const domElement = useThree((s) => s.gl.domElement)

  useEffect(() => {
    let pressStart: { x: number; y: number } | null = null
    const onDown = (e: PointerEvent) => {
      if (e.button === 0) pressStart = { x: e.clientX, y: e.clientY }
    }
    const onUp = (e: PointerEvent) => {
      if (e.button !== 0 || !pressStart) return
      const moved = Math.hypot(e.clientX - pressStart.x, e.clientY - pressStart.y)
      pressStart = null
      if (moved >= CLICK_THRESHOLD_PX) return
      const uiState = useUiStore.getState()
      const tile = uiState.hoveredTile
      if (!tile) return
      if (uiState.mode.kind === 'placing') {
        if (dispatch({ kind: 'place', machineId: uiState.mode.machineId, tile })) uiState.cancel()
        return
      }
      if (uiState.mode.kind === 'moving') {
        const { machineId } = uiState.mode
        if (dispatch({ kind: 'move', machineId, tile })) uiState.select(machineId)
        return
      }
      const machine = machineAt(useGameStore.getState().game, tile)
      uiState.select(machine?.id ?? null)
    }
    domElement.addEventListener('pointerdown', onDown)
    domElement.addEventListener('pointerup', onUp)
    return () => {
      domElement.removeEventListener('pointerdown', onDown)
      domElement.removeEventListener('pointerup', onUp)
    }
  }, [domElement])

  return null
}
