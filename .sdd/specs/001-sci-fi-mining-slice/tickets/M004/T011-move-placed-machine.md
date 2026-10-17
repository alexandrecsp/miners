---
id: T011
title: Move a placed Machine
milestone: M004
blocked-by: [T005]
status: todo
---

## What to build

When a Deposit runs dry, the player selects the Machine, presses Move in the inspector, sees the accepting Tiles highlighted with a ghost and the Move cost next to it, and clicks a Tile to move the Machine there for Credits.

- The Move cost Query: the Machine Def's Move cost per Tile (Drill 2, Laser Miner 5, Refinery 4 in the defs) × the Manhattan distance, rounded up to whole Credits.
- The Move Player Action: the Machine must be placed; the target Tile must pass the Placement check; moving to the Machine's own Tile fails; the cost is paid. The Machine keeps its Base Stats and everything else.
- The UI Store's moving mode; the inspector's Move button; the cost shown beside the ghost on the hovered Tile.

## Design patterns

| Pattern | Where | Why |
|---|---|---|
| Command | Player Actions in the Game core | The HUD and the Scene are untested, so every player intent must reach the core as a plain value through one entry that tests can call |
| Result type | Player Actions and Save loading in the Game core | Expected failures (too few Credits, wrong Tile, unreadable Save) must reach the HUD as a reason to show, not as a thrown error |

## Acceptance criteria

- [ ] Moving a Drill 3 Tiles right and 2 Tiles down onto an Ore Deposit costs 10 Credits and puts it on the new Tile, leaving the old Tile free.
- [ ] A Move to a Tile that fails the Placement check fails with the same reason a Placement there would give, and changes nothing.
- [ ] A Move with too few Credits, of an unplaced Machine, or to the Machine's own Tile fails with a reason and changes nothing.
- [ ] A Drill moved off a depleted spot to a fresh Ore Deposit goes from Idle to Working.
- [ ] In the app, Move from the inspector highlights accepting Tiles, shows the cost beside the ghost, and moves the Machine on click.
