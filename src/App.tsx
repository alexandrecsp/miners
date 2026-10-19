import { lazy, Suspense } from 'react'
import { AwaySummaryDialog } from './hud/AwaySummaryDialog'
import { MachineInspector } from './hud/MachineInspector'
import { Hotkeys } from './hud/Hotkeys'
import { Dock } from './hud/Dock'
import { ViewDrawer } from './hud/ViewDrawer'
import { Notice } from './hud/Notice'
import { StatusBar } from './hud/StatusBar'
import { UnlockWatcher } from './hud/UnlockWatcher'
import { GameCanvas } from './scene/GameCanvas'

/** Dev Tools exist only in development: the dynamic import sits behind the flag, so a production build drops it and leva. */
const DevTools = import.meta.env.DEV ? lazy(() => import('./dev/DevTools')) : null

export function App() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-void">
      <GameCanvas />
      <StatusBar />
      <ViewDrawer />
      <Dock />
      <Hotkeys />
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
