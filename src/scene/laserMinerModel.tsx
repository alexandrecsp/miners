import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { AdditiveBlending, Color, ShaderMaterial } from 'three'
import type { Group } from 'three'
import { machineStatus } from '../core/queries'
import { useGameStore } from '../store/gameStore'
import { scenePalette } from './palette'
import { shared, sharedBodyMaterial, sharedBox, sharedCylinder, sharedSphere, sharedStandard } from './machineResources'

/** Height of the emitter's lens above the Tile; the beam runs from there down into the Deposit. */
const EMITTER_Y = 0.86
/** Where the beam ends: inside the Deposit model. */
const IMPACT_Y = 0.2
const BEAM_LENGTH = EMITTER_Y - IMPACT_Y
const BEAM_RADIUS = 0.07
/** Corner positions of the gantry's four legs. */
const LEGS: readonly [number, number][] = [
  [-0.3, -0.3],
  [0.3, -0.3],
  [-0.3, 0.3],
  [0.3, 0.3],
]

const BEAM_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewDir;
  void main() {
    vUv = uv;
    vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
    vNormalView = normalize(normalMatrix * normal);
    vViewDir = normalize(-viewPos.xyz);
    gl_Position = projectionMatrix * viewPos;
  }
`

// HDR output above the Bloom threshold makes the beam bloom; bands scroll down towards the Deposit.
const BEAM_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uCore;
  varying vec2 vUv;
  varying vec3 vNormalView;
  varying vec3 vViewDir;
  void main() {
    float facing = abs(dot(normalize(vNormalView), normalize(vViewDir)));
    float core = pow(facing, 3.0);
    float bands = 0.65 + 0.35 * sin(vUv.y * 40.0 + uTime * 18.0);
    float flicker = 0.85 + 0.15 * sin(uTime * 53.0) * sin(uTime * 31.0);
    vec3 colour = mix(uColor, uCore, core) * (1.5 + 3.5 * core) * bands * flicker;
    gl_FragColor = vec4(colour, facing);
  }
`

/** The beam's shader material, shared by every Laser Miner; uTime is written by whichever beam is showing. */
function sharedBeamMaterial(): ShaderMaterial {
  return shared('beam', () => new ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uColor: { value: new Color(scenePalette('laserMinerGlow')) }, uCore: { value: new Color(scenePalette('laserBeamCore')) } },
    vertexShader: BEAM_VERTEX,
    fragmentShader: BEAM_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    toneMapped: false,
  }))
}

/** The beam and its impact glow, shown only while the Machine Status is Working, read each frame through getState(). */
function LaserBeam({ machineId }: { machineId: string }) {
  const group = useRef<Group>(null)
  const material = sharedBeamMaterial()
  const glow = scenePalette('laserMinerGlow')
  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    g.visible = machineStatus(useGameStore.getState().game, machineId).kind === 'working'
    if (!g.visible) return
    const t = clock.elapsedTime
    material.uniforms.uTime!.value = t
    const pulse = 1 + 0.25 * Math.sin(t * 14)
    g.scale.set(pulse, 1, pulse)
  })
  return (
    <group ref={group} visible={false}>
      <mesh
        position={[0, IMPACT_Y + BEAM_LENGTH / 2, 0]}
        material={material}
        geometry={sharedCylinder(BEAM_RADIUS, BEAM_RADIUS * 1.6, BEAM_LENGTH, 16, 1, true)}
      />
      <mesh position={[0, IMPACT_Y, 0]} geometry={sharedSphere(0.11, 16, 12)} material={sharedStandard({ color: glow, emissive: glow, emissiveIntensity: 6, toneMapped: false })} />
    </group>
  )
}

export interface LaserMinerModelProps {
  /** The placed Machine whose Status drives the beam; absent for the placement preview, which shows no beam. */
  machineId?: string
  ghost?: boolean
  hovered?: boolean
}

/** The Laser Miner: a four-legged gantry straddling its Deposit with an emitter head that fires a beam down into it. */
export function LaserMinerModel({ machineId, ghost, hovered }: LaserMinerModelProps) {
  const body = scenePalette('laserMiner')
  const glow = scenePalette('laserMinerGlow')
  const bodyMaterial = sharedBodyMaterial(body, hovered, ghost)
  const headMaterial = sharedStandard({ color: body, metalness: 0.9, roughness: 0.25, ghost })
  const lensMaterial = sharedStandard({ color: glow, emissive: glow, emissiveIntensity: hovered ? 5 : 3, ghost })
  return (
    <group>
      {LEGS.map(([x, z]) => (
        <mesh key={`${x},${z}`} position={[x, 0.45, z]} geometry={sharedBox(0.08, 0.9, 0.08)} material={bodyMaterial} />
      ))}
      <mesh position={[0, 0.94, 0]} geometry={sharedBox(0.7, 0.1, 0.7)} material={bodyMaterial} />
      <mesh position={[0, 1.12, 0]} geometry={sharedCylinder(0.16, 0.2, 0.22, 12)} material={headMaterial} />
      <mesh position={[0, EMITTER_Y + 0.02, 0]} geometry={sharedCylinder(0.07, 0.11, 0.08, 12)} material={lensMaterial} />
      {machineId && !ghost ? <LaserBeam machineId={machineId} /> : null}
    </group>
  )
}
