---
id: T017
title: Remove a Mod and refit it elsewhere
milestone: M007
blocked-by: [T016]
status: todo
---

## What to build

The player removes a fitted Mod from a Machine in the inspector; it goes back to the Mod Inventory for free and can be fitted on another Machine.

- The Remove Mod Player Action: takes the Mod in a given Mod Slot of a Machine back into the Mod Inventory, freeing the Slot. Free of charge.
- The inspector's remove button on each filled Mod Slot.

## Design patterns

| Pattern | Where | Why |
|---|---|---|
| Command | Player Actions in the Game core | The HUD and the Scene are untested, so every player intent must reach the core as a plain value through one entry that tests can call |
| Result type | Player Actions and Save loading in the Game core | Expected failures (too few Credits, wrong Tile, unreadable Save) must reach the HUD as a reason to show, not as a thrown error |

## Acceptance criteria

- [ ] Removing a fitted Mod returns it to the Mod Inventory, frees its Slot, restores the Machine's Effective Stat, and costs nothing.
- [ ] A removed Mod can be fitted on a second Machine, whose Effective Stat then changes.
- [ ] Removing from an empty Slot, a Slot number the Machine does not have, or an unknown Machine fails with a reason and changes nothing.
- [ ] In the app, a Mod removed in the inspector appears in the Mod Inventory and can be fitted on another Machine.
