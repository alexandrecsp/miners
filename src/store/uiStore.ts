import { create } from 'zustand'
import type { StringId } from '../core/strings'
import type { Tile } from '../core/types'

/** What a click on the Scene means: nothing special, placing a Machine from the Machine Inventory, or moving a placed Machine. */
export type InteractionMode = { kind: 'none' } | { kind: 'placing'; machineId: string }
  | { kind: 'moving'; machineId: string }

const NOTICE_MS = 3500

interface UiState {
  hoveredTile: Tile | null
  setHoveredTile: (tile: Tile | null) => void
  selectedMachineId: string | null
  mode: InteractionMode
  /** The HUD notice: a string id to show, with a counter so a repeat of the same reason still shows anew. */
  notice: { reason: StringId; serial: number } | null
  startPlacing: (machineId: string) => void
  /** Enter moving mode for a placed Machine; it stays selected. */
  startMoving: (machineId: string) => void
  select: (machineId: string | null) => void
  /** Escape: leave placing mode and clear the selection. */
  cancel: () => void
  showNotice: (reason: StringId) => void
}

/** The id of the Machine being moved, or null. */
export const selectMovingId = (s: UiState): string | null => (s.mode.kind === 'moving' ? s.mode.machineId : null)

/** The id of the Machine being placed, or null. */
export const selectPlacingId = (s: UiState): string | null => (s.mode.kind === 'placing' ? s.mode.machineId : null)

let noticeTimer: ReturnType<typeof setTimeout> | null = null
let noticeSerial = 0

/** View state that is never saved. */
export const useUiStore = create<UiState>((set, get) => ({
  hoveredTile: null,
  setHoveredTile: (tile) => {
    const current = get().hoveredTile
    if (current?.x === tile?.x && current?.y === tile?.y) return
    set({ hoveredTile: tile })
  },
  selectedMachineId: null,
  mode: { kind: 'none' },
  notice: null,
  startPlacing: (machineId) => set({ mode: { kind: 'placing', machineId }, selectedMachineId: null }),
  startMoving: (machineId) => set({ mode: { kind: 'moving', machineId }, selectedMachineId: machineId }),
  select: (machineId) => set({ selectedMachineId: machineId, mode: { kind: 'none' } }),
  cancel: () => set({ mode: { kind: 'none' }, selectedMachineId: null }),
  showNotice: (reason) => {
    if (noticeTimer !== null) clearTimeout(noticeTimer)
    noticeSerial += 1
    set({ notice: { reason, serial: noticeSerial } })
    noticeTimer = setTimeout(() => set({ notice: null }), NOTICE_MS)
  },
}))
