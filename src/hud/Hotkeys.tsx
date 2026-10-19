import { useEffect } from 'react'
import { useUiStore } from '../store/uiStore'
import { HUD_VIEW_TABLE } from './hudViews'

/** True when a key event's target is a field the player types into, so hotkeys must ignore it. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT'
}

const VIEW_KEY = new RegExp(`^(?:Digit|Numpad)([1-${HUD_VIEW_TABLE.length}])$`)

/** The HUD's keyboard handling: the number keys toggle the dock's views, and Escape cancels, which also closes the drawer. */
export function Hotkeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target)) return
      if (e.code === 'Escape') {
        useUiStore.getState().cancel()
        return
      }
      if (e.repeat) return
      const digit = VIEW_KEY.exec(e.code)?.[1]
      const entry = HUD_VIEW_TABLE.find((v) => v.hotkey === Number(digit))
      if (entry) useUiStore.getState().toggleHudView(entry.view)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return null
}
