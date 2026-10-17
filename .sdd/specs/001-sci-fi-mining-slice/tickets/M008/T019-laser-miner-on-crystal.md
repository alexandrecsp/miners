---
id: T019
title: Mine Ore and Crystal with the Laser Miner and show its beam
milestone: M008
blocked-by: [T014, T018]
status: todo
---

## What to build

The player places a bought Laser Miner on an Ore or a Crystal Deposit. It mines whatever the Deposit holds, fast and with heavy Wear, and while Working it fires a glowing animated beam down into its Deposit. Crystal now reaches Storage, so the Ore plus Crystal Recipe from T013 can run.

- The Laser Miner's Placement rule: an Ore or a Crystal Deposit. The Drill keeps its Ore-only rule.
- The Mining system takes the yielded Resource from the Deposit the Miner stands on, so a Laser Miner on Crystal fills Crystal Storage within the Crystal Storage Cap and adds to Crystal mined.
- The Laser Miner's procedural model in the model registry, and its beam: a shader-driven animated emissive beam, shown only while the Machine Status is Working, read in `useFrame` through `getState()`.

## Design patterns

| Pattern | Where | Why |
|---|---|---|
| Factory Method | The model registry in the Scene | What is drawn for a def depends on its def id at runtime, and procedural models must be replaceable by `.glb` models without changing game code |

## Acceptance criteria

- [ ] A Laser Miner places on an Ore Deposit and on a Crystal Deposit, and fails on an Empty Tile and a Rock with a reason.
- [ ] A Laser Miner on a Crystal Deposit adds Crystal to Storage and to Crystal mined, and the Deposit shrinks by yield ÷ Effective Efficiency.
- [ ] At the Crystal Storage Cap it reports Idle for Storage full, while a Laser Miner on Ore keeps working.
- [ ] A Laser Miner wears faster than a Drill of equal Durability.
- [ ] With Crystal mined and a Refinery on Ore plus Crystal, Advancing produces Alloy from both.
- [ ] In the app, a Working Laser Miner shows an animated beam that blooms; the beam disappears when it is Idle or Broken.
