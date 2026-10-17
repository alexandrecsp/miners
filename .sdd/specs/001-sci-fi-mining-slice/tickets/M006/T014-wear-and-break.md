---
id: T014
title: Wear Machines down until they break
milestone: M006
blocked-by: [T012]
status: done
---

## What to build

Working Machines lose Condition over time, faster for low Durability and for hard-wearing Machine Defs, and produce less as they wear. At 0% a Machine is Broken and stops. The player sees Condition as a bar in the inspector, and a Broken Machine looks broken in the Scene.

- The Wear system in the Step, after Mining and Refining, as the spec describes: each Machine that produced in this Step loses Condition at its Machine Def's wear rate (Drill 0.25, Laser Miner 0.8, Refinery 0.15 percentage points per second, in the defs) ÷ Effective Durability × `dt` × the share of its potential output it actually produced (potential output being what it would produce in the Step at its current Condition with no Storage, Deposit or input limit); Condition never goes below 0%; Lifetime Wear grows by the Condition lost.
- The output factor in Mining and Refining: 0.5 + 0.5 × Condition ÷ 100 above 0%, and 0 when Broken.
- Machine Status Broken at 0% Condition.
- The inspector's Condition bar and Lifetime Wear; the Broken status light and a dimmed, tilted or sparking look for Broken Machines, read in `useFrame` through `getState()`.

## Design patterns

| Pattern | Where | Why |
|---|---|---|
| Pipeline | The Step's systems | One Step runs an ordered series of independent rules over the Game State, and their order matters (production before Wear, Wear before Sell Orders) |

## Acceptance criteria

- [ ] A Working Drill with Durability 1 loses 2.5 Condition points in 10 s, and its Lifetime Wear grows by 2.5.
- [ ] Doubling Effective Durability halves the Wear; a Laser Miner def wears faster than a Drill at equal Durability.
- [ ] An Idle Machine (Storage full, inputs missing or no Deposit) loses no Condition; a Machine producing at half its potential loses half the Wear.
- [ ] At 50% Condition a Miner yields 75% of its full-Condition yield.
- [ ] Condition stops at exactly 0%; the Machine reports Broken and yields nothing and wears no further, however long it is Advanced.
- [ ] Machines in the Machine Inventory do not wear.
- [ ] Advancing a Drill from 100% until it breaks with 5 s Steps ends within 2% of 0.1 s Steps in total output and time to break.
- [ ] In the app, a Working Drill's Condition bar falls, and a Broken Machine's look and status light change.
