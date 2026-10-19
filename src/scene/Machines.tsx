import { useFrame } from '@react-three/fiber'
import { Select } from '@react-three/postprocessing'
import { useRef } from 'react'
import type { Group, MeshStandardMaterial } from 'three'
import { machineStatus } from '../core/queries'
import type { MachineStatus } from '../core/queries'
import { sameTile } from '../core/tile'
import type { Machine } from '../core/types'
import { useGameStore } from '../store/gameStore'
import { useUiStore } from '../store/uiStore'
import { tileToWorld } from './grid'
import { scenePalette } from './palette'
import type { PaletteKey } from './palette'
import { getMachineModel } from './modelRegistry'

/** The palette colour of each Machine Status kind; a new kind fails to compile until it has one. */
const STATUS_COLOUR: Record<MachineStatus['kind'], PaletteKey> = {
  inventory: 'statusIdle',
  working: 'statusWorking',
  idle: 'statusIdle',
  broken: 'statusBroken',
}

/** A small emissive light whose colour follows the Machine Status, read each frame through getState(). */
function StatusLight({ machineId }: { machineId: string }) {
  const material = useRef<MeshStandardMaterial>(null)
  useFrame(({ clock }) => {
    const mat = material.current
    if (!mat) return
    const status = machineStatus(useGameStore.getState().game, machineId)
    const colour = scenePalette(STATUS_COLOUR[status.kind])
    mat.emissive.set(colour)
    mat.color.set(colour)
    // A Broken Machine's light sparks: it flickers between bright and dark.
    mat.emissiveIntensity = status.kind === 'broken' ? 1 + 5 * Math.abs(Math.sin(clock.elapsedTime * 23)) : 4
  })
  return (
    <mesh position={[0.22, 0.5, 0.31]}>
      <sphereGeometry args={[0.06, 12, 12]} />
      <meshStandardMaterial ref={material} emissiveIntensity={4} />
    </mesh>
  )
}

/** How far a Broken Machine leans, in radians. */
const BROKEN_TILT = 0.3

/** Tilts the Machine's body when it is Broken, read each frame through getState(). */
function BrokenTilt({ machineId, children }: { machineId: string; children: React.ReactNode }) {
  const group = useRef<Group>(null)
  useFrame(() => {
    const g = group.current
    if (!g) return
    g.rotation.z = machineStatus(useGameStore.getState().game, machineId).kind === 'broken' ? BROKEN_TILT : 0
  })
  return <group ref={group}>{children}</group>
}

function PlacedMachine({ machine, gridSize }: { machine: Machine; gridSize: number }) {
  const hovered = useUiStore((s) => s.hoveredTile !== null && machine.tile !== null && sameTile(s.hoveredTile, machine.tile))
  const selected = useUiStore((s) => s.selectedMachineId === machine.id)
  if (!machine.tile) return null
  const Model = getMachineModel(machine.defId)
  const { x, z } = tileToWorld(machine.tile, gridSize)
  return (
    <group position={[x, 0, z]}>
      <BrokenTilt machineId={machine.id}>
        <Select enabled={selected}>
          <Model defId={machine.defId} machineId={machine.id} hovered={hovered} />
        </Select>
      </BrokenTilt>
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
