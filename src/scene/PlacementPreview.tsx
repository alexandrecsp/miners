import { useLayoutEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import type { InstancedMesh } from 'three'
import { placementTiles } from '../core/queries'
import { useGameStore } from '../store/gameStore'
import { selectPlacingId, useUiStore } from '../store/uiStore'
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

/** While placing: highlights exactly the accepting Tiles and shows a ghost Machine on the hovered Tile. */
export function PlacementPreview() {
  const machineId = useUiStore(selectPlacingId)
  const hovered = useUiStore((s) => s.hoveredTile)
  const machines = useGameStore((s) => s.game.machines)
  const grid = useGameStore((s) => s.game.grid)
  const tiles = useMemo(() => (machineId ? placementTiles({ machines, grid }, machineId) : []), [machines, grid, machineId])
  const machine = machineId ? machines.find((m) => m.id === machineId) : undefined
  if (!machineId || !machine) return null
  const size = grid.size
  const Model = getMachineModel(machine.defId)
  const ghost = hovered ? tileToWorld(hovered, size) : null
  return (
    <>
      <AcceptingTiles key={tiles.length} tiles={tiles} size={size} />
      {ghost && (
        <group position={[ghost.x, 0, ghost.z]}>
          <Model defId={machine.defId} ghost />
        </group>
      )}
    </>
  )
}
