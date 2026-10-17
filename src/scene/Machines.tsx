import { Select } from '@react-three/postprocessing'
import { sameTile } from '../core/tile'
import type { Machine } from '../core/types'
import { useGameStore } from '../store/gameStore'
import { useUiStore } from '../store/uiStore'
import { tileToWorld } from './grid'
import { getMachineModel } from './modelRegistry'

function PlacedMachine({ machine, gridSize }: { machine: Machine; gridSize: number }) {
  const hovered = useUiStore((s) => s.hoveredTile !== null && machine.tile !== null && sameTile(s.hoveredTile, machine.tile))
  const selected = useUiStore((s) => s.selectedMachineId === machine.id)
  if (!machine.tile) return null
  const Model = getMachineModel(machine.defId)
  const { x, z } = tileToWorld(machine.tile, gridSize)
  return (
    <group position={[x, 0, z]}>
      <Select enabled={selected}>
        <Model defId={machine.defId} hovered={hovered} />
      </Select>
    </group>
  )
}

/** Every placed Machine, one mesh group each, drawn from the model registry. */
export function Machines() {
  const machines = useGameStore((s) => s.game.machines)
  const gridSize = useGameStore((s) => s.game.grid.size)
  return (
    <>
      {machines.map((m) => (m.tile ? <PlacedMachine key={m.id} machine={m} gridSize={gridSize} /> : null))}
    </>
  )
}
