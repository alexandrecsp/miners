import { MachineInspector } from './hud/MachineInspector'
import { MachineInventory } from './hud/MachineInventory'
import { MarketPanel } from './hud/MarketPanel'
import { Notice } from './hud/Notice'
import { ShopPanel } from './hud/ShopPanel'
import { TopBar } from './hud/TopBar'
import { GameCanvas } from './scene/GameCanvas'

export function App() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-void">
      <GameCanvas />
      <TopBar />
      <MachineInventory />
      <MarketPanel />
      <ShopPanel />
      <MachineInspector />
      <Notice />
    </main>
  )
}
