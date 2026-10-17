---
id: T003
title: Render the isometric Zone with the HUD top bar
milestone: M001
blocked-by: [T002]
status: done
---

## What to build

The first screen of the game: the Zone drawn as an isometric Grid under the final sci-fi look, a camera the player can pan and zoom, and the HUD top bar over it.

- The R3F canvas with an orthographic camera at a fixed isometric angle; pan by left-drag past a small threshold and by WASD and the arrow keys; zoom by wheel between fixed limits; the camera target clamped to the Grid; no rotation.
- The model registry keyed by def id: instanced kinds (Tile, Rock, Ore Deposit, Crystal Deposit) get a procedural geometry and material; Machine Defs get a procedural component (first used in T004).
- Tiles, Rocks and each Deposit kind drawn as one InstancedMesh per kind, rebuilt when the set of Deposits changes; Tiles outside the Unlocked Area drawn darker. Ore and Crystal Deposits look clearly different, Crystal with an emissive glow.
- Lighting from a drei `Environment` of procedural `Lightformer`s plus one directional key light, dark fog and PBR materials; postprocessing with Bloom and Vignette; device pixel ratio between 1 and 2.
- Tile picking by intersecting the pointer ray with the ground plane, kept as the hovered Tile in the UI Store and shown as a subtle Tile highlight.
- The HUD top bar: Credits and, per Resource, the amount, the Storage Cap and the Market Price, through the display formatter and the string table.

## Design patterns

| Pattern | Where | Why |
|---|---|---|
| Factory Method | The model registry in the Scene | What is drawn for a def depends on its def id at runtime, and procedural models must be replaceable by `.glb` models without changing game code |

## Acceptance criteria

- [ ] In `npm run dev`, the Grid, Rocks, Ore Deposits and Crystal Deposits are visible and distinguishable, with emissive parts blooming in a dark, fogged scene.
- [ ] Dragging and WASD pan the camera, the wheel zooms within limits, and the view cannot leave the Grid.
- [ ] A click without drag does not pan; moving the pointer moves the hovered-Tile highlight.
- [ ] Tiles outside the Unlocked Area are visibly darker.
- [ ] The top bar shows 50 Credits and, for Ore, Crystal and Alloy, 0 of the Storage Cap and the Market Price.
- [ ] Swapping one registry entry for a different procedural model changes how that kind is drawn without editing any other Scene file.
- [ ] Each instanced kind is drawn by a single InstancedMesh.
