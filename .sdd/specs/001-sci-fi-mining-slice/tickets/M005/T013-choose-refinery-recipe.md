---
id: T013
title: Choose a Refinery's Recipe
milestone: M005
blocked-by: [T012]
status: done
---

## What to build

The player selects a Refinery and switches its Recipe in the inspector between Ore to Alloy and Ore plus Crystal to Alloy. With Ore plus Crystal, the Refinery draws both from Storage and makes Alloy at the better ratio; without Crystal it Idles.

- The Set Recipe Player Action: the Machine must be a Refinery (placed or in the Machine Inventory) and the Recipe must exist.
- The Refining system follows each Refinery's own Recipe.
- The inspector's Recipe selector, showing each Recipe's inputs and output from the string table and defs.

## Design patterns

| Pattern | Where | Why |
|---|---|---|
| Command | Player Actions in the Game core | The HUD and the Scene are untested, so every player intent must reach the core as a plain value through one entry that tests can call |
| Result type | Player Actions and Save loading in the Game core | Expected failures (too few Credits, wrong Tile, unreadable Save) must reach the HUD as a reason to show, not as a thrown error |

## Acceptance criteria

- [ ] Setting a Refinery to Ore plus Crystal and Advancing 10 s at Rate 0.5 and Efficiency 1, with ample Ore and Crystal, uses 10 Ore and 5 Crystal and adds 10 Alloy.
- [ ] On Ore plus Crystal with Ore but no Crystal, the Refinery reports Idle for inputs missing and uses no Ore.
- [ ] Two Refineries on different Recipes each follow their own.
- [ ] Setting a Recipe on a Drill, or an unknown Recipe, fails with a reason and changes nothing.
- [ ] A newly bought Refinery is on Ore to Alloy.
- [ ] In the app, switching a Refinery to Ore plus Crystal in the inspector makes it show Idle for inputs missing while Crystal Storage is empty, and switching back to Ore to Alloy makes it Work again.
