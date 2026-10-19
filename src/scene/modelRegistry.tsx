import type { ComponentType } from 'react'
import {
  BoxGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  MeshStandardMaterial,
  OctahedronGeometry,
} from 'three'
import type { BufferGeometry, Material, Object3D } from 'three'
import type { MachineDefId } from '../core/defs'
import type { Tile } from '../core/types'
import { LaserMinerModel } from './laserMinerModel'
import { scenePalette } from './palette'
import type { PaletteKey } from './palette'

export type InstancedKind = 'tile' | 'rock' | 'ore' | 'crystal'

/** What one instanced kind looks like: its geometry, material and pose per Tile. Locked-Tile shading is the Zone's job. */
export interface InstancedModel {
  geometry: BufferGeometry
  material: Material
  /** Writes the pose of one instance onto `dummy`, whose position is already at the Tile centre. */
  pose: (dummy: Object3D, tile: Tile) => void
}

export interface MachineModelProps {
  defId: MachineDefId
  /** The placed Machine drawn, for models whose look follows its Machine Status; absent for the placement preview. */
  machineId?: string
  /** Drawn translucent, as the placement preview. */
  ghost?: boolean
  /** The pointer is over the Machine: its glow brightens. */
  hovered?: boolean
}

/** Hash of a Tile to a stable value in [0, 1), so scenery varies without randomness. */
function tileNoise(tile: Tile, salt: number): number {
  const n = Math.sin(tile.x * 127.1 + tile.y * 311.7 + salt * 74.7) * 43758.5453
  return n - Math.floor(n)
}

const INSTANCED_FACTORIES: Record<InstancedKind, () => InstancedModel> = {
  tile: () => ({
    geometry: new BoxGeometry(0.94, 0.3, 0.94),
    material: new MeshStandardMaterial({ color: scenePalette('tile'), metalness: 0.5, roughness: 0.6 }),
    pose: (dummy) => {
      dummy.position.y = -0.15
    },
  }),
  rock: () => ({
    geometry: new DodecahedronGeometry(0.34, 0),
    material: new MeshStandardMaterial({ color: scenePalette('rock'), metalness: 0.2, roughness: 0.9, flatShading: true }),
    pose: (dummy, tile) => {
      dummy.position.y = 0.12
      dummy.rotation.y = tileNoise(tile, 1) * Math.PI * 2
      const s = 0.7 + tileNoise(tile, 2) * 0.7
      dummy.scale.set(s, 0.6 + tileNoise(tile, 3) * 0.5, s)
    },
  }),
  ore: () => ({
    geometry: new CylinderGeometry(0.28, 0.4, 0.34, 7),
    material: new MeshStandardMaterial({
      color: scenePalette('ore'),
      metalness: 0.7,
      roughness: 0.45,
      emissive: scenePalette('oreGlow'),
      emissiveIntensity: 0.4,
      flatShading: true,
    }),
    pose: (dummy, tile) => {
      dummy.position.y = 0.17
      dummy.rotation.y = tileNoise(tile, 4) * Math.PI
    },
  }),
  crystal: () => ({
    geometry: new OctahedronGeometry(0.3, 0),
    material: new MeshStandardMaterial({
      color: scenePalette('crystal'),
      metalness: 0.1,
      roughness: 0.15,
      emissive: scenePalette('crystalGlow'),
      emissiveIntensity: 3.5,
      flatShading: true,
    }),
    pose: (dummy, tile) => {
      dummy.position.y = 0.38
      dummy.rotation.y = tileNoise(tile, 5) * Math.PI
      dummy.scale.set(0.9, 1.7, 0.9)
    },
  }),
}

const MACHINE_COLORS: Record<MachineDefId, { body: PaletteKey; glow: PaletteKey }> = {
  drill: { body: 'drill', glow: 'drillGlow' },
  laserMiner: { body: 'laserMiner', glow: 'laserMinerGlow' },
  refinery: { body: 'refinery', glow: 'refineryGlow' },
}

function ProceduralMachine({ defId, ghost, hovered }: MachineModelProps) {
  const body = scenePalette(MACHINE_COLORS[defId].body)
  const glow = scenePalette(MACHINE_COLORS[defId].glow)
  return (
    <group>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color={body} metalness={0.8} roughness={0.35} emissive={body} emissiveIntensity={hovered ? 0.5 : 0} transparent={ghost} opacity={ghost ? 0.5 : 1} />
      </mesh>
      <mesh position={[0, 0.68, 0]}>
        <boxGeometry args={[0.24, 0.16, 0.24]} />
        <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={hovered ? 5 : 2} transparent={ghost} opacity={ghost ? 0.5 : 1} />
      </mesh>
    </group>
  )
}

const MACHINE_MODELS: Record<MachineDefId, ComponentType<MachineModelProps>> = {
  drill: ProceduralMachine,
  laserMiner: LaserMinerModel,
  refinery: ProceduralMachine,
}

const instancedCache = new Map<InstancedKind, InstancedModel>()

/** Factory Method: the model for an instanced kind, built on first use. Edit its entry above to change how the kind is drawn. */
export function getInstancedModel(kind: InstancedKind): InstancedModel {
  let model = instancedCache.get(kind)
  if (!model) {
    model = INSTANCED_FACTORIES[kind]()
    instancedCache.set(kind, model)
  }
  return model
}

/** Factory Method: the component that draws a Machine Def, found by def id. */
export function getMachineModel(defId: MachineDefId): ComponentType<MachineModelProps> {
  return MACHINE_MODELS[defId]
}
