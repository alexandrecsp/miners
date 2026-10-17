---
id: T016
title: Buy Mods and fit them into Mod Slots
milestone: M007
blocked-by: [T005]
status: todo
---

## What to build

The player opens the Mods panel, buys a Mod from the Mod Catalogue into the Mod Inventory, selects a Machine, and fits the Mod into a free Mod Slot from the inspector. The Machine's Effective Stats change at once and the inspector shows Base and Effective values side by side.

- The Mod Def catalogue with the miner Mods from the spec, which fit the Drill and the Laser Miner: Overclocked Motor (Rate × 1.25, 80 Credits), Precision Bit (Efficiency + 0.2, 60 Credits), Reinforced Casing (Durability × 1.3, 70 Credits). Each Mod Def names its Stat, whether it is a multiplier or a flat bonus, its value, its price and the Machine Defs it fits. Refinery Mods arrive with their Unlock in T021.
- Mod Slot counts from the Machine Defs (Drill 2, Laser Miner 3, Refinery 2).
- The Buy Mod Player Action: pays the price and adds the Mod to the Mod Inventory.
- The Fit Mod Player Action: takes a Mod from the Mod Inventory into a free Mod Slot of a Machine it fits, placed or in the Machine Inventory. The same Mod Def may fill several Slots.
- The Effective Stats Query now applies the fitted Mods through the Effective Stat formula, so Mining, Refining and Wear use them.
- The Mods panel (Mod Catalogue with prices and the Mod Inventory with counts); the inspector's Mod Slots with a fit control listing fitting Mods from the Mod Inventory.

## Design patterns

| Pattern | Where | Why |
|---|---|---|
| Command | Player Actions in the Game core | The HUD and the Scene are untested, so every player intent must reach the core as a plain value through one entry that tests can call |
| Result type | Player Actions and Save loading in the Game core | Expected failures (too few Credits, wrong Tile, unreadable Save) must reach the HUD as a reason to show, not as a thrown error |

## Acceptance criteria

- [ ] Buying a Mod removes its price from Credits and adds one to its count in the Mod Inventory; with too few Credits it fails with a reason and changes nothing.
- [ ] Fitting an Overclocked Motor on a Drill with Base Rate 1 gives Effective Rate 1.25, and the Drill then yields 25% more per Step.
- [ ] A Laser Miner with Base Rate 2, Base Efficiency 1, two Overclocked Motors and a Precision Bit has Effective Rate 3.125 and Effective Efficiency 1.2; flat bonuses are not multiplied.
- [ ] Fitting into a Machine with no free Mod Slot, fitting a miner Mod on a Refinery, or fitting a Mod not in the Mod Inventory fails with a reason and changes nothing.
- [ ] A Reinforced Casing slows the Machine's Wear by its multiplier.
- [ ] In the app, a Mod bought in the Mods panel is fitted from the inspector, and the inspector's Effective Stats change.
