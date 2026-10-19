import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { startAutosave } from './persistence/autosave'
import { boot } from './persistence/boot'
import { startSimLoop } from './store/simLoop'

void boot().then(() => {
  startSimLoop()
  startAutosave()
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
