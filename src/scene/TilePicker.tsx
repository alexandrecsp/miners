import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Plane, Raycaster, Vector2, Vector3 } from 'three'
import { useGameStore } from '../store/gameStore'
import { useUiStore } from '../store/uiStore'
import { worldToTile } from './grid'

const GROUND = new Plane(new Vector3(0, 1, 0), 0)

/** Keeps the hovered Tile in the UI Store by intersecting the pointer ray with the ground plane. */
export function TilePicker() {
  const camera = useThree((s) => s.camera)
  const domElement = useThree((s) => s.gl.domElement)

  useEffect(() => {
    const raycaster = new Raycaster()
    const ndc = new Vector2()
    const hit = new Vector3()
    let pointer: { x: number; y: number } | null = null
    let frame = 0
    const pick = () => {
      if (!pointer) return
      const rect = domElement.getBoundingClientRect()
      ndc.set(((pointer.x - rect.left) / rect.width) * 2 - 1, -((pointer.y - rect.top) / rect.height) * 2 + 1)
      raycaster.setFromCamera(ndc, camera)
      const size = useGameStore.getState().game.grid.size
      const point = raycaster.ray.intersectPlane(GROUND, hit)
      useUiStore.getState().setHoveredTile(point ? worldToTile(point.x, point.z, size) : null)
    }
    // Re-pick every animation frame while the pointer is over the canvas, so panning and zooming under a still pointer keep the hover current.
    const loop = () => {
      pick()
      frame = requestAnimationFrame(loop)
    }
    const onMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY }
      if (frame === 0) loop()
    }
    const onLeave = () => {
      pointer = null
      cancelAnimationFrame(frame)
      frame = 0
      useUiStore.getState().setHoveredTile(null)
    }
    domElement.addEventListener('pointermove', onMove)
    domElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      domElement.removeEventListener('pointermove', onMove)
      domElement.removeEventListener('pointerleave', onLeave)
    }
  }, [camera, domElement])

  return null
}
