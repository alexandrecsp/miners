---
id: T010
title: Buy an Offer and place it from the Machine Inventory
milestone: M004
blocked-by: [T009]
status: done
---

## What to build

The player buys an Offer from the Shop; the Machine appears in the Machine Inventory with the exact Base Stats shown in the Offer, and the player places it like the Starting Kit Drill.

- The Buy Offer Player Action: pays the Offer's price; the Offer's Machine gets a new id from the id counter and joins the Machine Inventory with its rolled Base Stats and 100% Condition; the Offer leaves the Shop Stock (which stays one short until the next Shop Refresh).
- The Shop panel's Buy button per Offer, disabled with the reason shown when Credits are short.
- The Machine Inventory panel lists every unplaced Machine with its Machine Def name and Base Stats.
- A bought Refinery can be bought and waits in the Machine Inventory; until its Placement rule arrives in T012, the Placement check rejects every Tile for it with a reason.

## Design patterns

| Pattern | Where | Why |
|---|---|---|
| Command | Player Actions in the Game core | The HUD and the Scene are untested, so every player intent must reach the core as a plain value through one entry that tests can call |
| Result type | Player Actions and Save loading in the Game core | Expected failures (too few Credits, wrong Tile, unreadable Save) must reach the HUD as a reason to show, not as a thrown error |

## Acceptance criteria

- [ ] Buying an Offer with enough Credits removes its price from Credits, adds a Machine with the Offer's exact Base Stats and 100% Condition to the Machine Inventory, and removes the Offer from the Shop Stock.
- [ ] Buying with too few Credits, or an Offer id not in the Shop Stock, fails with a reason and changes nothing.
- [ ] Two bought Machines get different ids.
- [ ] A bought Drill can then be placed on an Ore Deposit and mines.
- [ ] In the app, a second Drill is bought, appears in the Machine Inventory, and is placed and mining.
