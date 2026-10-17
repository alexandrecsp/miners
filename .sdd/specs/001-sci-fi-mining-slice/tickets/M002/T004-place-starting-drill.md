---
id: T004
title: Place the Starting Kit Drill and inspect it
milestone: M002
blocked-by: [T003]
status: done
---

## What to build

The player opens the Machine Inventory, presses Place on the Starting Kit Drill, sees the Tiles that accept it highlighted with a ghost Drill following the pointer, and clicks an Ore Deposit to place it. A placed Machine tints when hovered; clicking it selects it, outlines it and opens the Machine inspector. A rejected Placement shows a notice with the reason.

- Player Actions in the Game core: the Player Action value type, Apply a Player Action returning the next Game State or a failure with a string-id reason, and the Place action.
- The Placement check Query (also used by the Place action): Tile inside the Unlocked Area, no Machine on it, and the Machine Def's Tile rule. This ticket implements the Drill's rule (an Ore Deposit); the Laser Miner and Refinery rules arrive in T019 and T012.
- The Game Store's `dispatch`, which publishes a failure reason as a HUD notice.
- The UI Store's selection and interaction mode (none, placing a Machine).
- The Machine Inventory panel with a Place button per Machine; with no instructions shown, the first screen draws attention to the waiting Drill.
- Placed Machines drawn as individual meshes from the model registry; hover tint; the postprocessing Outline effect on the selected Machine; Escape cancels placing and clears the selection.
- The Machine inspector showing the Machine Def name and the Base Stats.

## Design patterns

| Pattern | Where | Why |
|---|---|---|
| Command | Player Actions in the Game core | The HUD and the Scene are untested, so every player intent must reach the core as a plain value through one entry that tests can call |
| Result type | Player Actions and Save loading in the Game core | Expected failures (too few Credits, wrong Tile, unreadable Save) must reach the HUD as a reason to show, not as a thrown error |
| Factory Method | The model registry in the Scene | What is drawn for a def depends on its def id at runtime, and procedural models must be replaceable by `.glb` models without changing game code |

## Acceptance criteria

- [ ] Placing the Starting Kit Drill on an Ore Deposit inside the Unlocked Area succeeds: the Machine has that Tile and is no longer in the Machine Inventory.
- [ ] Placing a Drill on a Crystal Deposit, a Rock, an empty Tile, a Tile outside the Unlocked Area or a Tile with a Machine fails, each with its own reason, and leaves the Game State unchanged.
- [ ] Placing a Machine that is already placed, or an id that does not exist, fails with a reason.
- [ ] The Placement check Query agrees with the Place action for every Tile of a new game.
- [ ] In the app, placing mode highlights exactly the accepting Tiles, a ghost Drill follows the pointer, and a click on a highlighted Tile places the Drill.
- [ ] In the app, clicking a rejected Tile shows a notice with the reason's text from the string table.
- [ ] In the app, hovering a placed Drill tints it, clicking it outlines it and opens the inspector with its Base Stats, and Escape clears the selection.
