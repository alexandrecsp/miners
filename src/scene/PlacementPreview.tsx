import { useLayoutEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import type { InstancedMesh } from 'three'
import { Html } from '@react-three/drei'
import { formatNumber } from '../core/format'
import { checkMove, moveTiles, placementTiles } from '../core/queries'
import { t } from '../core/strings'
import { useGameStore } from '../store/gameStore'
import { selectMovingId, selectPlacingId, useUiStore } from '../store/uiStore'
import type { Tile } from '../core/types'
import { tileToWorld } from './grid'
import { getMachineModel } from './modelRegistry'
import { scenePalette } from './palette'

const dummy = new Object3D()

/** The accepting Tiles as one InstancedMesh of plates. */
function AcceptingTiles({ tiles, size }: { tiles: Tile[]; size: number }) {
  const ref = useRef<InstancedMesh>(null)
  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    tiles.forEach((tile, i) => {
      const { x, z } = tileToWorld(tile, size)
      dummy.position.set(x, 0.03, z)
      dummy.rotation.set(-Math.PI / 2, 0, 0)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [tiles, size])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, tiles.length]} frustumCulled={false}>
      <planeGeometry args={[0.96, 0.96]} />
      <meshBasicMaterial color={scenePalette('highlight')} transparent opacity={0.45} depthWrite={false} />
    </instancedMesh>
  )
}

/** While placing or moving: highlights exactly the accepting Tiles and shows a ghost Machine on the hovered Tile; for a Move, its cost too. */
export function PlacementPreview() {
  const placingId = useUiStore(selectPlacingId)
  const movingId = useUiStore(selectMovingId)
  const machineId = placingId ?? movingId
  const hovered = useUiStore((s) => s.hoveredTile)
  const machines = useGameStore((s) => s.game.machines)
  const grid = useGameStore((s) => s.game.grid)
  const tiles = useMemo(() => (
    !machineId ? [] : movingId ? moveTiles({ machines, grid }, machineId) : placementTiles({ machines, grid }, machineId)
  ), [machines, grid, machineId, movingId])
  const machine = machineId ? machines.find((m) => m.id === machineId) : undefined
  if (!machineId || !machine) return null
  const size = grid.size
  const Model = getMachineModel(machine.defId)
  // The cost is a Query; Credits are not considered here so it shows even when the Move is unaffordable.
  const moveCheck = movingId && hovered ? checkMove({ machines, grid, credits: Infinity }, movingId, hovered) : null
  const cost = moveCheck?.ok ? moveCheck.value : null
  const ghost = hovered ? tileToWorld(hovered, size) : null
  return (
    <>
      <AcceptingTiles key={tiles.length} tiles={tiles} size={size} />
      {ghost && (
        <group position={[ghost.x, 0, ghost.z]}>
          <Model defId={machine.defId} ghost />
          {cost !== null && (
            <Html position={[0, 1.2, 0]} center className="pointer-events-none whitespace-nowrap border border-edge bg-panel/90 px-2 py-1 text-xs text-accent">
              {t('hud.moveCost')}: {formatNumber(cost)}
            </Html>
          )}
        </group>
      )}
    </>
  )
}
