import { BoxGeometry, CylinderGeometry, MeshStandardMaterial, SphereGeometry } from 'three'
import type { BufferGeometry, Material } from 'three'

/** The cached Machine geometries and materials, shared by every Machine of a Machine Def (and its ghost), built once per key. */
const machineResources = new Map<string, unknown>()

/** The one instance for `key`, made on first use. */
export function shared<T extends BufferGeometry | Material>(key: string, make: () => T): T {
  let value = machineResources.get(key) as T | undefined
  if (!value) {
    value = make()
    machineResources.set(key, value)
  }
  return value
}

export function sharedBox(width: number, height: number, depth: number): BoxGeometry {
  return shared(`box:${width},${height},${depth}`, () => new BoxGeometry(width, height, depth))
}

export function sharedCylinder(top: number, bottom: number, height: number, radial: number, heightSeg = 1, open = false): CylinderGeometry {
  return shared(`cyl:${top},${bottom},${height},${radial},${heightSeg},${open}`, () => new CylinderGeometry(top, bottom, height, radial, heightSeg, open))
}

export function sharedSphere(radius: number, widthSegments: number, heightSegments: number): SphereGeometry {
  return shared(`sphere:${radius},${widthSegments},${heightSegments}`, () => new SphereGeometry(radius, widthSegments, heightSegments))
}

interface StandardOptions {
  color: string
  metalness?: number
  roughness?: number
  emissive?: string
  emissiveIntensity?: number
  ghost?: boolean
  toneMapped?: boolean
}

/** A shared MeshStandardMaterial; ghost variants are translucent. Without `emissive`, three's default (no glow) applies. */
export function sharedStandard(options: StandardOptions): MeshStandardMaterial {
  return shared(`std:${JSON.stringify(options)}`, () => new MeshStandardMaterial({
    color: options.color,
    metalness: options.metalness ?? 0,
    roughness: options.roughness ?? 1,
    ...(options.emissive !== undefined && { emissive: options.emissive }),
    emissiveIntensity: options.emissiveIntensity ?? 1,
    transparent: options.ghost ?? false,
    opacity: options.ghost ? 0.5 : 1,
    toneMapped: options.toneMapped ?? true,
  }))
}

/** The metal body material of a Machine; its glow brightens while the pointer is over it. */
export function sharedBodyMaterial(body: string, hovered: boolean | undefined, ghost: boolean | undefined): MeshStandardMaterial {
  return sharedStandard({ color: body, metalness: 0.8, roughness: 0.35, emissive: body, emissiveIntensity: hovered ? 0.5 : 0, ghost })
}
