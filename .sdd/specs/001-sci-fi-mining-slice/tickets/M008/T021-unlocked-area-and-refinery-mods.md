---
id: T021
title: Grow the Unlocked Area and unlock Refinery Mods
milestone: M008
blocked-by: [T016, T018]
status: todo
---

## What to build

Two Unlocks take effect. Each Unlocked Area Unlock grows the central playable square (12 × 12 to 18 × 18, 24 × 24 and 32 × 32), so more Deposits become reachable and new Deposits can spawn there; the newly unlocked Tiles light up in the Scene. The Refinery Mods Unlock adds the Refinery Mods to the Mod Catalogue for buying.

- The Unlocked Area Unlocks set the Game State's Unlocked Area size when earned; the Placement check, Moves and Deposit spawns follow it, and the Deposit limit scales with its Tile count.
- The Scene redraws locked and unlocked Tiles when the Unlocked Area changes.
- The Refinery Mods in the Mod Catalogue, fitting only Refineries: Catalyst Bed (Efficiency × 1.2, 150 Credits), Induction Coils (Rate + 0.1, 150 Credits), Heat Shielding (Durability × 1.3, 120 Credits). A Mod Def may name an Unlock it requires; Buy Mod fails while that Unlock is not earned.
- The Mods panel shows Refinery Mods as locked, with their Unlock, until it is earned.

## Design patterns

| Pattern | Where | Why |
|---|---|---|
| Command | Player Actions in the Game core | The HUD and the Scene are untested, so every player intent must reach the core as a plain value through one entry that tests can call |
| Result type | Player Actions and Save loading in the Game core | Expected failures (too few Credits, wrong Tile, unreadable Save) must reach the HUD as a reason to show, not as a thrown error |

## Acceptance criteria

- [ ] Reaching 3,000 Ore mined grows the Unlocked Area to 18 × 18; a Deposit just outside the old area then accepts a Drill.
- [ ] After the Unlocked Area grows, new Deposits can spawn in the added Tiles and the Deposit limit grows with the Tile count.
- [ ] Before the Refinery Mods Unlock, buying a Catalyst Bed fails with a reason; after it, the purchase succeeds and the Mod fits a Refinery but not a Drill.
- [ ] A Catalyst Bed on a Refinery raises the Alloy it makes per batch by 20%.
- [ ] In the app, earning an Unlocked Area Unlock lights up the added Tiles, and the Mods panel shows Refinery Mods locked and then buyable.
