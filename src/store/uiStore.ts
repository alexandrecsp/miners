import { create } from 'zustand'
import type { Tile } from '../core/types'

interface UiState {
  hoveredTile: Tile | null
  setHoveredTile: (tile: Tile | null) => void
}

/** View state that is never saved. */
export const useUiStore = create<UiState>((set, get) => ({
  hoveredTile: null,
  setHoveredTile: (tile) => {
    const current = get().hoveredTile
    if (current?.x === tile?.x && current?.y === tile?.y) return
    set({ hoveredTile: tile })
  },
}))
