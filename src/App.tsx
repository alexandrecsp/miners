import { TopBar } from './hud/TopBar'
import { GameCanvas } from './scene/GameCanvas'

export function App() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-void">
      <GameCanvas />
      <TopBar />
    </main>
  )
}
