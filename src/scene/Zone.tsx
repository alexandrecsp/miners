import { useLayoutEffect, useMemo, useRef } from 'react'
import { Color, Object3D } from 'three'
import type { InstancedMesh } from 'three'
import { useShallow } from 'zustand/react/shallow'
import type { DepositResource } from '../core/defs'
import { isTileUnlocked } from '../core/queries'
import type { GridShape, Tile } from '../core/types'
import { useGameStore } from '../store/gameStore'
import { tileToWorld } from './grid'
import { getInstancedModel } from './modelRegistry'
import type { InstancedKind } from './modelRegistry'
import { scenePalette } from './palette'

const dummy = new Object3D()

/** One InstancedMesh for one kind; `tint`, when given, colours each instance by its Tile. */
function InstancedKindMesh({
  kind,
  tiles,
  size,
  tint,
}: {
  kind: InstancedKind
  tiles: Tile[]
  size: number
  tint?: (tile: Tile) => Color
}) {
  const ref = useRef<InstancedMesh>(null)
  const model = getInstancedModel(kind)

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    tiles.forEach((tile, i) => {
      const { x, z } = tileToWorld(tile, size)
      dummy.position.set(x, 0, z)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(1, 1, 1)
      model.pose(dummy, tile)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      if (tint) mesh.setColorAt(i, tint(tile))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [tiles, size, tint, model])

  // Keyed by count: an InstancedMesh cannot grow, so a different count remounts it.
  return <instancedMesh key={tiles.length} ref={ref} args={[model.geometry, model.material, tiles.length]} />
}

/** The Tiles of the Deposits of one Resource; the list changes only when the set of Deposits does. */
function useDepositTiles(resource: DepositResource): Tile[] {
  return useGameStore(useShallow((s) => s.game.grid.deposits.filter((d) => d.resource === resource).map((d) => d.tile)))
}

/** Every Tile of the Grid, row by row. */
function useGridTiles(size: number): Tile[] {
  return useMemo(() => Array.from({ length: size * size }, (_, i) => ({ x: i % size, y: Math.floor(i / size) })), [size])
}

/** Tiles, Rocks and each Deposit kind, one InstancedMesh per kind. */
export function Zone() {
  const size = useGameStore((s) => s.game.grid.size)
  const unlockedSize = useGameStore((s) => s.game.grid.unlockedSize)
  const rocks = useGameStore((s) => s.game.grid.rocks)
  const shape: GridShape = useMemo(() => ({ size, unlockedSize }), [size, unlockedSize])
  const tiles = useGridTiles(size)
  const oreTiles = useDepositTiles('ore')
  const crystalTiles = useDepositTiles('crystal')
  // Locked Tiles are shaded here, not in the model, so any replacement model gets it.
  const tileTint = useMemo(() => {
    const unlocked = new Color(scenePalette('unlockedTint'))
    const locked = new Color(scenePalette('lockedDim'))
    return (tile: Tile) => (isTileUnlocked(shape, tile) ? unlocked : locked)
  }, [shape])

  return (
    <group>
      <InstancedKindMesh kind="tile" tiles={tiles} size={size} tint={tileTint} />
      <InstancedKindMesh kind="rock" tiles={rocks} size={size} />
      <InstancedKindMesh kind="ore" tiles={oreTiles} size={size} />
      <InstancedKindMesh kind="crystal" tiles={crystalTiles} size={size} />
    </group>
  )
}
