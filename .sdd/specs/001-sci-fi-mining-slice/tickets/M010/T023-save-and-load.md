---
id: T023
title: Save and load the Game State
milestone: M010
blocked-by: [T022]
status: todo
---

## What to build

The game saves itself to IndexedDB every 10 seconds and when the page is hidden, and a reload restores exactly where the player was. Old Saves pass through a Migration chain; a Save that cannot be loaded is backed up and a new game starts instead of crashing.

- Save in the Game core: serialise a Game State with the current real time into a Save record (Save Version set to the current version, 1; Last Seen set to that time); load a raw stored value by running the Migration chain from its Save Version to the current one, returning the Game State or a failure (not a Save, a Save Version newer than the game knows, a Migration that fails). The loader takes the Migration list as an input; the production list is empty while the Save Version is 1.
- Persistence: an idb-keyval adapter reading and writing one Save record under one fixed key; autosave every 10 s while visible and once on `visibilitychange` to hidden.
- The boot sequence: with no Save, a new game seeded from the clock; with a Save that fails to load, its raw value copied to a backup key, then a new game; with a loaded Save, that Game State. The Sim Loop starts afterwards.

## Design patterns

| Pattern | Where | Why |
|---|---|---|
| Result type | Player Actions and Save loading in the Game core | Expected failures (too few Credits, wrong Tile, unreadable Save) must reach the HUD as a reason to show, not as a thrown error |
| Dependency Injection | The Rng in the Step, the current time in Offline Replay and Save serialisation, the Migration list in Save loading | Tests must force random outcomes, times and Migrations without global state |

## Acceptance criteria

- [ ] A played Game State (Machines placed, Mods fitted, Sell Orders set, Unlocks earned) serialised and loaded is equal to the original, apart from Last Seen being the given time.
- [ ] A Save loaded with a test Migration list of two Migrations (version 1 to 2, 2 to 3) runs both in order and returns the shape of version 3.
- [ ] A Save already at the current Save Version loads without running any Migration.
- [ ] Loading a value that is not a Save, a Save with a newer Save Version than the game knows, or one whose Migration throws, returns a failure and does not throw.
- [ ] Generator state is restored, so the Shop Stock after a reload and a Shop Refresh is the same as without the reload.
- [ ] In the app, progress survives a reload with at most about 10 s lost; hiding the tab then closing it keeps the latest progress.
- [ ] In the app, a corrupted Save leaves a backup copy and starts a new game.
