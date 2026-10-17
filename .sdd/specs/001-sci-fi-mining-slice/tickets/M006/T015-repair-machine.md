---
id: T015
title: Repair a Machine
milestone: M006
blocked-by: [T014]
status: done
---

## What to build

The player selects a worn or Broken Machine and presses Repair in the inspector, which shows the cost. The Machine is restored to 100% Condition at once, and a Broken Machine starts working again. Each later Repair of the same Machine costs more, because its Lifetime Wear grows.

- The Repair cost Query: the Machine Def's Repair cost per point (Drill 0.3, Laser Miner 1.0, Refinery 0.5 in the defs) × missing Condition points × (1 + Lifetime Wear ÷ 1000), rounded up to whole Credits.
- The Repair Player Action: pays the Repair cost and sets Condition to 100%; Lifetime Wear is unchanged. Fails when Condition is already 100%.
- The inspector's Repair button with its cost, disabled with the reason when Credits are short or Condition is full.

## Design patterns

| Pattern | Where | Why |
|---|---|---|
| Command | Player Actions in the Game core | The HUD and the Scene are untested, so every player intent must reach the core as a plain value through one entry that tests can call |
| Result type | Player Actions and Save loading in the Game core | Expected failures (too few Credits, wrong Tile, unreadable Save) must reach the HUD as a reason to show, not as a thrown error |

## Acceptance criteria

- [ ] A Drill at 40% Condition with 0 Lifetime Wear costs 18 Credits to Repair; with 500 Lifetime Wear it costs 27.
- [ ] Repair sets Condition to 100%, removes the cost from Credits, and leaves Lifetime Wear unchanged.
- [ ] A Broken Machine, once Repaired, produces again on the next Step.
- [ ] Repairing at 100% Condition, with too few Credits, or an unknown Machine fails with a reason and changes nothing.
- [ ] Repairing the same Machine after the same amount of Wear costs more the second time.
- [ ] In the app, Repair in the inspector shows its cost, restores the Condition bar to full and brings a Broken Machine back to Working.
