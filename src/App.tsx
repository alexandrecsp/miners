import { MachineInspector } from './hud/MachineInspector'
import { MachineInventory } from './hud/MachineInventory'
import { Notice } from './hud/Notice'
import { TopBar } from './hud/TopBar'
import { GameCanvas } from './scene/GameCanvas'

export function App() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-void">
      <GameCanvas />
      <TopBar />
      <MachineInventory />
      <MachineInspector />
      <Notice />
    </main>
  )
}
