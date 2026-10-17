import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { CAMERA_POSITION, CAMERA_ZOOM_START, CameraRig } from './CameraRig'
import { TileHighlight } from './TileHighlight'
import { TilePicker } from './TilePicker'
import { scenePalette } from './palette'
import { Zone } from './Zone'

function Lighting() {
  return (
    <>
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={1.2} color={scenePalette('lightSky')} position={[0, 6, -6]} scale={[14, 4, 1]} />
        <Lightformer form="rect" intensity={0.8} color={scenePalette('lightWarm')} position={[-8, 3, 4]} rotation-y={Math.PI / 2} scale={[10, 3, 1]} />
        <Lightformer form="ring" intensity={0.6} color={scenePalette('lightCyan')} position={[6, 8, 6]} scale={6} />
      </Environment>
      <directionalLight position={[-20, 40, 15]} intensity={1.6} color={scenePalette('key')} />
      <fog attach="fog" args={[scenePalette('fog'), 110, 190]} />
    </>
  )
}

/** The R3F canvas: an isometric orthographic view of the Zone under sci-fi lighting. */
export function GameCanvas() {
  return (
    <Canvas
      orthographic
      dpr={[1, 2]}
      camera={{ position: CAMERA_POSITION, zoom: CAMERA_ZOOM_START, near: -50, far: 300 }}
    >
      <color attach="background" args={[scenePalette('fog')]} />
      <Lighting />
      <Zone />
      <TileHighlight />
      <TilePicker />
      <CameraRig />
      <EffectComposer>
        <Bloom intensity={0.9} luminanceThreshold={0.8} luminanceSmoothing={0.2} mipmapBlur />
        <Vignette eskil={false} offset={0.2} darkness={0.7} />
      </EffectComposer>
    </Canvas>
  )
}
