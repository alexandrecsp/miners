import { useFrame } from '@react-three/fiber'
import { Select } from '@react-three/postprocessing'
import { useRef } from 'react'
import type { Group, Mesh } from 'three'
import { useShallow } from 'zustand/react/shallow'
import { machineStatus } from '../core/queries'
import type { MachineStatus } from '../core/queries'
import { sameTile } from '../core/tile'
import { useGameStore } from '../store/gameStore'
import { useUiStore } from '../store/uiStore'
import { tileToWorld } from './grid'
import { scenePalette } from './palette'
import type { PaletteKey } from './palette'
import { getMachineModel } from './modelRegistry'
import { sharedSphere, sharedStandard } from './machineResources'

/** The palette colour of each Machine Status kind; a new kind fails to compile until it has one. */
const STATUS_COLOUR: Record<MachineStatus['kind'], PaletteKey> = {
  inventory: 'statusIdle',
  working: 'statusWorking',
  idle: 'statusIdle',
  broken: 'statusBroken',
}

/** The shared material of one Machine Status kind; every Machine in that Status uses the same one. */
function statusMaterial(kind: MachineStatus['kind']) {
  const colour = scenePalette(STATUS_COLOUR[kind])
  return sharedStandard({ color: colour, emissive: colour, emissiveIntensity: kind === 'broken' ? 1 : 4 })
}

/** A small emissive light whose shared material follows the Machine Status, read each frame through getState(). */
function StatusLight({ machineId }: { machineId: string }) {
  const mesh = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    const m = mesh.current
    if (!m) return
    const status = machineStatus(useGameStore.getState().game, machineId)
    const mat = statusMaterial(status.kind)
    m.material = mat
    // A Broken Machine's light sparks: it flickers between bright and dark (one value for all Broken lights).
    if (status.kind === 'broken') mat.emissiveIntensity = 1 + 5 * Math.abs(Math.sin(clock.elapsedTime * 23))
  })
  return <mesh ref={mesh} position={[0.22, 0.5, 0.31]} geometry={sharedSphere(0.06, 12, 12)} material={statusMaterial('idle')} />
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

function PlacedMachine({ machineId }: { machineId: string }) {
  // Narrow selectors: the Machine's Def and Tile change only on buy or Move, not on a Tick.
  const machine = useGameStore(useShallow((s) => {
    const found = s.game.machines.find((m) => m.id === machineId)
    return found ? { defId: found.defId, tile: found.tile } : null
  }))
  const gridSize = useGameStore((s) => s.game.grid.size)
  const tile = machine?.tile ?? null
  const hovered = useUiStore((s) => s.hoveredTile !== null && tile !== null && sameTile(s.hoveredTile, tile))
  const selected = useUiStore((s) => s.selectedMachineId === machineId)
  if (!machine || !tile) return null
  const { defId } = machine
  const Model = getMachineModel(defId)
  const { x, z } = tileToWorld(tile, gridSize)
  return (
    <group position={[x, 0, z]}>
      <BrokenTilt machineId={machineId}>
        <Select enabled={selected}>
          <Model defId={defId} machineId={machineId} hovered={hovered} />
        </Select>
      </BrokenTilt>
      <StatusLight machineId={machineId} />
    </group>
  )
}

/** Every placed Machine, one mesh group each, drawn from the model registry. Re-renders only when the set of placed Machines changes, not on a Tick. */
export function Machines() {
  const placedIds = useGameStore(useShallow((s) => s.game.machines.filter((m) => m.tile).map((m) => m.id)))
  return (
    <>
      {placedIds.map((id) => (
        <PlacedMachine key={id} machineId={id} />
      ))}
    </>
  )
}
