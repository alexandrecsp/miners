import { lazy, Suspense } from 'react'
import { AwaySummaryDialog } from './hud/AwaySummaryDialog'
import { MachineInspector } from './hud/MachineInspector'
import { MachineInventory } from './hud/MachineInventory'
import { MarketPanel } from './hud/MarketPanel'
import { ModsPanel } from './hud/ModsPanel'
import { SellOrdersPanel } from './hud/SellOrdersPanel'
import { Notice } from './hud/Notice'
import { ShopPanel } from './hud/ShopPanel'
import { StoragePanel } from './hud/StoragePanel'
import { TopBar } from './hud/TopBar'
import { UnlocksPanel } from './hud/UnlocksPanel'
import { UnlockWatcher } from './hud/UnlockWatcher'
import { GameCanvas } from './scene/GameCanvas'

/** Dev Tools exist only in development: the dynamic import sits behind the flag, so a production build drops it and leva. */
const DevTools = import.meta.env.DEV ? lazy(() => import('./dev/DevTools')) : null

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
      <SellOrdersPanel />
      <UnlocksPanel />
      <UnlockWatcher />
      <MachineInspector />
      <Notice />
      <AwaySummaryDialog />
      {DevTools && (
        <Suspense fallback={null}>
          <DevTools />
        </Suspense>
      )}
    </main>
  )
}
