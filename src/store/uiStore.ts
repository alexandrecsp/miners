import { create } from 'zustand'
import { OFFLINE } from '../core/defs'
import type { UnlockId } from '../core/defs'
import type { AwaySummary } from '../core/offline'
import type { StringId } from '../core/strings'
import type { Tile } from '../core/types'

/** What a click on the Scene means: nothing special, placing a Machine from the Machine Inventory, or moving a placed Machine. */
export type InteractionMode = { kind: 'none' } | { kind: 'placing'; machineId: string }
  | { kind: 'moving'; machineId: string }

/** The HUD views the dock opens, in dock order. */
export const HUD_VIEWS = ['market', 'machines', 'mods', 'base'] as const
export type HudView = (typeof HUD_VIEWS)[number]

const NOTICE_MS = 3500

/** What a HUD notice tells the player: why a Player Action failed, or which Unlock was just earned. */
export type NoticeContent = { kind: 'failure'; reason: StringId } | { kind: 'unlockEarned'; unlockId: UnlockId }

interface UiState {
  /** The HUD view open in the drawer, or null. */
  openView: HudView | null
  openHudView: (view: HudView) => void
  /** Opens the view, or closes it when it is already the open one. */
  toggleHudView: (view: HudView) => void
  closeHudView: () => void
  hoveredTile: Tile | null
  setHoveredTile: (tile: Tile | null) => void
  selectedMachineId: string | null
  mode: InteractionMode
  /** The HUD notice showing now, with a counter so a repeat of the same notice still shows anew. */
  notice: (NoticeContent & { serial: number }) | null
  startPlacing: (machineId: string) => void
  /** Enter moving mode for a placed Machine; it stays selected. */
  startMoving: (machineId: string) => void
  select: (machineId: string | null) => void
  /** Escape: leave placing mode and clear the selection. */
  cancel: () => void
  /** Shows a failure reason at once. An earned Unlock's notice it interrupts goes back to the front of the queue. */
  showFailure: (reason: StringId) => void
  /** Queues an earned Unlock's notice; queued notices show one after another, so none is lost. */
  showUnlockEarned: (unlockId: UnlockId) => void
  /** The Away Summary dialog to show, or null. */
  awaySummary: AwaySummary | null
  /** Shows an Away Summary when its replayed time is at least the minimum; a newer one replaces one not yet dismissed. */
  showAwaySummary: (summary: AwaySummary) => void
  dismissAwaySummary: () => void
}

/** The id of the Machine being moved, or null. */
export const selectMovingId = (s: UiState): string | null => (s.mode.kind === 'moving' ? s.mode.machineId : null)

/** The id of the Machine being placed, or null. */
export const selectPlacingId = (s: UiState): string | null => (s.mode.kind === 'placing' ? s.mode.machineId : null)

/** Opening a HUD view clears the selection and any Placement or Move, so the drawer and the Machine inspector never show together. */
const NO_SELECTION_OR_MODE = { selectedMachineId: null, mode: { kind: 'none' } } as const

let noticeTimer: ReturnType<typeof setTimeout> | null = null
let noticeSerial = 0
/** Notices waiting for the one showing to end. */
let waitingNotices: NoticeContent[] = []

/** View state that is never saved. */
export const useUiStore = create<UiState>((set, get) => {
  const showNow = (content: NoticeContent): void => {
    if (noticeTimer !== null) clearTimeout(noticeTimer)
    noticeSerial += 1
    set({ notice: { ...content, serial: noticeSerial } })
    noticeTimer = setTimeout(() => {
      noticeTimer = null
      const next = waitingNotices.shift()
      if (next) showNow(next)
      else set({ notice: null })
    }, NOTICE_MS)
  }
  return {
    openView: null,
    openHudView: (view) => set({ openView: view, ...NO_SELECTION_OR_MODE }),
    toggleHudView: (view) =>
      set(get().openView === view ? { openView: null } : { openView: view, ...NO_SELECTION_OR_MODE }),
    closeHudView: () => set({ openView: null }),
    hoveredTile: null,
    setHoveredTile: (tile) => {
      const current = get().hoveredTile
      if (current?.x === tile?.x && current?.y === tile?.y) return
      set({ hoveredTile: tile })
    },
    selectedMachineId: null,
    mode: { kind: 'none' },
    notice: null,
    startPlacing: (machineId) => set({ mode: { kind: 'placing', machineId }, selectedMachineId: null, openView: null }),
    startMoving: (machineId) => set({ mode: { kind: 'moving', machineId }, selectedMachineId: machineId, openView: null }),
    select: (machineId) => {
      // Selecting a Machine closes the drawer; deselecting keeps it open.
      const closeDrawer = machineId === null ? {} : { openView: null }
      set({ selectedMachineId: machineId, mode: { kind: 'none' }, ...closeDrawer })
    },
    cancel: () => set({ mode: { kind: 'none' }, selectedMachineId: null, openView: null }),
    showFailure: (reason) => {
      const current = get().notice
      if (current?.kind === 'unlockEarned') waitingNotices = [{ kind: 'unlockEarned', unlockId: current.unlockId }, ...waitingNotices]
      showNow({ kind: 'failure', reason })
    },
    showUnlockEarned: (unlockId) => {
      if (get().notice === null) showNow({ kind: 'unlockEarned', unlockId })
      else waitingNotices = [...waitingNotices, { kind: 'unlockEarned', unlockId }]
    },
    awaySummary: null,
    showAwaySummary: (summary) => {
      if (summary.seconds >= OFFLINE.summaryMinSeconds) set({ awaySummary: summary })
    },
    dismissAwaySummary: () => set({ awaySummary: null }),
  }
})
