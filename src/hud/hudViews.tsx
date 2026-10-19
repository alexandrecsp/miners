import type { ComponentType } from 'react'
import type { StringId } from '../core/strings'
import type { HudView } from '../store/uiStore'
import { MachineInventory } from './MachineInventory'
import { MarketPanel } from './MarketPanel'
import { ModsPanel } from './ModsPanel'
import { SellOrdersPanel } from './SellOrdersPanel'
import { ShopPanel } from './ShopPanel'
import { StoragePanel } from './StoragePanel'
import { UnlocksPanel } from './UnlocksPanel'

export interface HudViewEntry {
  view: HudView
  labelId: StringId
  /** The number key that toggles the view; also the number shown on its dock button. */
  hotkey: number
  /** The panels the drawer shows for the view, top to bottom. */
  panels: ComponentType[]
}

/** The HUD views in dock order: the one table the dock, the drawer and the hotkeys read. */
export const HUD_VIEW_TABLE: readonly HudViewEntry[] = [
  { view: 'market', labelId: 'hud.market', hotkey: 1, panels: [MarketPanel, SellOrdersPanel] },
  { view: 'machines', labelId: 'hud.machines', hotkey: 2, panels: [MachineInventory, ShopPanel] },
  { view: 'mods', labelId: 'hud.mods', hotkey: 3, panels: [ModsPanel] },
  { view: 'base', labelId: 'hud.base', hotkey: 4, panels: [StoragePanel, UnlocksPanel] },
]
