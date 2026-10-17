import { useGameStore } from '../store/gameStore'
import { useUiStore } from '../store/uiStore'
import { tileToWorld } from './grid'
import { scenePalette } from './palette'

/** A subtle plate over the hovered Tile. */
export function TileHighlight() {
  const tile = useUiStore((s) => s.hoveredTile)
  const size = useGameStore((s) => s.game.grid.size)
  if (!tile) return null
  const { x, z } = tileToWorld(tile, size)
  return (
    <mesh position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.98, 0.98]} />
      <meshBasicMaterial color={scenePalette('highlight')} transparent opacity={0.28} depthWrite={false} />
    </mesh>
  )
}
