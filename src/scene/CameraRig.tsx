import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, Vector3 } from 'three'
import type { OrthographicCamera } from 'three'
import { useGameStore } from '../store/gameStore'

const CAMERA_OFFSET = new Vector3(60, 60, 60)
const ZOOM_MIN = 18
const ZOOM_MAX = 90
export const CAMERA_ZOOM_START = 36
const ZOOM_STEP = 1.12
const DRAG_THRESHOLD_PX = 4
/** Keyboard pan speed in screen pixels per second; divided by zoom to get world units. */
const KEY_PAN_SPEED = 700
const PAN_KEYS: Record<string, [number, number]> = {
  KeyW: [0, 1],
  ArrowUp: [0, 1],
  KeyS: [0, -1],
  ArrowDown: [0, -1],
  KeyA: [-1, 0],
  ArrowLeft: [-1, 0],
  KeyD: [1, 0],
  ArrowRight: [1, 0],
}

const axisRight = new Vector3()
const axisForward = new Vector3()

/** Fills the shared `axisRight` and `axisForward` with the ground-plane unit vectors of screen right and up. */
function updateGroundAxes(camera: OrthographicCamera): void {
  axisRight.set(1, 0, 0).applyQuaternion(camera.quaternion).setY(0).normalize()
  axisForward.set(0, 0, -1).applyQuaternion(camera.quaternion).setY(0).normalize()
}

export const CAMERA_POSITION = CAMERA_OFFSET.toArray() as [number, number, number]

/** Pan (drag, WASD, arrows) and zoom (wheel) for the fixed isometric camera; the target stays on the Grid. */
export function CameraRig() {
  const camera = useThree((s) => s.camera) as OrthographicCamera
  const domElement = useThree((s) => s.gl.domElement)
  const target = useRef(new Vector3())
  const keys = useRef(new Set<string>())

  useEffect(() => {
    const sinElevation = Math.sin(Math.atan2(CAMERA_OFFSET.y, Math.hypot(CAMERA_OFFSET.x, CAMERA_OFFSET.z)))

    let pointerId: number | null = null
    let startX = 0
    let startY = 0
    let lastX = 0
    let lastY = 0
    let dragging = false

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      pointerId = e.pointerId
      startX = lastX = e.clientX
      startY = lastY = e.clientY
      dragging = false
    }
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return
      if (!dragging && Math.hypot(e.clientX - startX, e.clientY - startY) < DRAG_THRESHOLD_PX) return
      if (!dragging) {
        dragging = true
        domElement.setPointerCapture(e.pointerId)
      }
      updateGroundAxes(camera)
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      target.current.addScaledVector(axisRight, -dx / camera.zoom)
      target.current.addScaledVector(axisForward, dy / (camera.zoom * sinElevation))
      lastX = e.clientX
      lastY = e.clientY
    }
    const onPointerEnd = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return
      pointerId = null
      dragging = false
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP
      camera.zoom = MathUtils.clamp(camera.zoom * factor, ZOOM_MIN, ZOOM_MAX)
      camera.updateProjectionMatrix()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code in PAN_KEYS) keys.current.add(e.code)
    }
    const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.code)
    const onBlur = () => keys.current.clear()

    domElement.addEventListener('pointerdown', onPointerDown)
    domElement.addEventListener('pointermove', onPointerMove)
    domElement.addEventListener('pointerup', onPointerEnd)
    domElement.addEventListener('pointercancel', onPointerEnd)
    domElement.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      domElement.removeEventListener('pointerdown', onPointerDown)
      domElement.removeEventListener('pointermove', onPointerMove)
      domElement.removeEventListener('pointerup', onPointerEnd)
      domElement.removeEventListener('pointercancel', onPointerEnd)
      domElement.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [camera, domElement])

  useFrame((_, delta) => {
    const half = useGameStore.getState().game.grid.size / 2
    if (keys.current.size > 0) {
      let sx = 0
      let sy = 0
      for (const code of keys.current) {
        const [kx = 0, ky = 0] = PAN_KEYS[code] ?? []
        sx += kx
        sy += ky
      }
      const step = (KEY_PAN_SPEED * delta) / camera.zoom
      updateGroundAxes(camera)
      target.current.addScaledVector(axisRight, sx * step).addScaledVector(axisForward, sy * step)
    }
    target.current.x = MathUtils.clamp(target.current.x, -half, half)
    target.current.z = MathUtils.clamp(target.current.z, -half, half)
    camera.position.copy(target.current).add(CAMERA_OFFSET)
    camera.lookAt(target.current)
  })

  return null
}
