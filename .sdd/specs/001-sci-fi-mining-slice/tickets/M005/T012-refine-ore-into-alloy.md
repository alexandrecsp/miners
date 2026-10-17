---
id: T012
title: Place a Refinery and refine Ore into Alloy
milestone: M005
blocked-by: [T008, T010]
status: done
---

## What to build

The player buys a Refinery, places it on an Empty Tile, and watches it turn Ore from Storage into Alloy, which they sell on the Market. A Refinery with too little Ore, or with Alloy Storage full, goes Idle and consumes nothing.

- The Refinery's Placement rule: an Empty Tile (inside the Unlocked Area, no Deposit, no Rock, no Machine).
- The Recipe defs: Ore to Alloy (4 Ore make 1 Alloy) and Ore plus Crystal to Alloy (2 Ore and 1 Crystal make 2 Alloy). A Refinery's Recipe is stored on the Machine; every new Refinery (in an Offer, bought, or placed) starts on Ore to Alloy.
- The Refining system in the Step, after Mining, as the spec describes: up to Effective Rate × output factor × `dt` batches, limited by the inputs in Storage and the room under the Alloy Storage Cap; removes the inputs and adds batches × Recipe Alloy × Effective Efficiency. Refineries are evaluated in id order.
- Machine Status Idle reasons for a Refinery: inputs missing, Storage full.
- The Refinery's procedural model in the model registry, with its status light; the inspector shows its Recipe.

## Design patterns

| Pattern | Where | Why |
|---|---|---|
| Pipeline | The Step's systems | One Step runs an ordered series of independent rules over the Game State, and their order matters (production before Wear, Wear before Sell Orders) |
| Factory Method | The model registry in the Scene | What is drawn for a def depends on its def id at runtime, and procedural models must be replaceable by `.glb` models without changing game code |

## Acceptance criteria

- [ ] A Refinery places on an Empty Tile and fails on a Deposit, a Rock, an occupied Tile or a Tile outside the Unlocked Area, each with a reason.
- [ ] A Refinery with Rate 0.5 and Efficiency 1.1 on Ore to Alloy, with ample Ore, Advanced 10 s, uses 20 Ore and adds 5.5 Alloy.
- [ ] With less Ore than a Step asks for, it processes only the batches the Ore allows; with no Ore it reports Idle for inputs missing and changes nothing.
- [ ] Alloy never exceeds the Alloy Storage Cap; at the cap the Refinery consumes no Ore and reports Idle for Storage full.
- [ ] Ore mined in a Step is available to Refineries in the same Step.
- [ ] Advancing with 5 s Steps ends within 1% of Advancing with 0.1 s Steps.
- [ ] In the app, a bought Refinery is placed on an Empty Tile, Alloy rises in the top bar while Ore is consumed, and the Alloy sells on the Market.
