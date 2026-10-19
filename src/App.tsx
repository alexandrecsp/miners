import { MachineInspector } from './hud/MachineInspector'
import { MachineInventory } from './hud/MachineInventory'
import { MarketPanel } from './hud/MarketPanel'
import { ModsPanel } from './hud/ModsPanel'
import { Notice } from './hud/Notice'
import { ShopPanel } from './hud/ShopPanel'
import { StoragePanel } from './hud/StoragePanel'
import { TopBar } from './hud/TopBar'
import { UnlocksPanel } from './hud/UnlocksPanel'
import { UnlockWatcher } from './hud/UnlockWatcher'
import { GameCanvas } from './scene/GameCanvas'

export function App() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-void">
      <GameCanvas />
      <TopBar />
      <MachineInventory />
      <MarketPanel />
      <ShopPanel />
      <ModsPanel />
      <StoragePanel />
      <UnlocksPanel />
      <UnlockWatcher />
      <MachineInspector />
      <Notice />
    </main>
  )
}
