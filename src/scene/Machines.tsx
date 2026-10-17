import { useFrame } from '@react-three/fiber'
import { Select } from '@react-three/postprocessing'
import { useRef } from 'react'
import type { MeshStandardMaterial } from 'three'
import { machineStatus } from '../core/queries'
import { sameTile } from '../core/tile'
import type { Machine } from '../core/types'
import { useGameStore } from '../store/gameStore'
import { useUiStore } from '../store/uiStore'
import { tileToWorld } from './grid'
import { scenePalette } from './palette'
import { getMachineModel } from './modelRegistry'

/** A small emissive light whose colour follows the Machine Status, read each frame through getState(). */
function StatusLight({ machineId }: { machineId: string }) {
  const material = useRef<MeshStandardMaterial>(null)
  useFrame(() => {
    const mat = material.current
    if (!mat) return
    const status = machineStatus(useGameStore.getState().game, machineId)
    const colour = scenePalette(status.kind === 'working' ? 'statusWorking' : 'statusIdle')
    mat.emissive.set(colour)
    mat.color.set(colour)
  })
  return (
    <mesh position={[0.22, 0.5, 0.31]}>
      <sphereGeometry args={[0.06, 12, 12]} />
      <meshStandardMaterial ref={material} emissiveIntensity={4} />
    </mesh>
  )
}

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
      <StatusLight machineId={machine.id} />
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
