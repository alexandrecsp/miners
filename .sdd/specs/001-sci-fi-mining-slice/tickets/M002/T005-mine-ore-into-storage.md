---
id: T005
title: Mine Ore into Storage within Storage Caps
milestone: M002
blocked-by: [T004]
status: todo
---

## What to build

A placed Drill mines Ore from its Deposit into Storage on every Tick. The Deposit shrinks by the yield divided by Efficiency and disappears when empty. Storage stops at the Ore Storage Cap and the Drill goes Idle. The inspector shows Effective Stats and the Machine Status; each Machine's status light shows it in the Scene; the top bar's Ore amount climbs.

- The Effective Stat formula: Base Stat times the product of multipliers plus the sum of flat bonuses (no Mods exist yet, so it returns the Base Stat; test it with plain inputs) and the Effective Stats Query for a Machine.
- The Mining system in the Step, as the spec's Step describes it, with the output factor fixed at its 100% Condition value until Wear arrives in T014. Machines are evaluated in id order.
- Storage Caps per Resource from the Storage Tier.
- The Machine Status Query: Working when the Machine produced in the last Step, otherwise Idle with its reason (not on a minable Deposit, including a depleted one; Storage full); it is not placed when in the Machine Inventory.
- The Machine inspector shows the Effective Stats and Machine Status; each placed Machine has an emissive status light whose colour follows its Machine Status, read in `useFrame` through `getState()`.
- When a Deposit is removed, the instanced Deposits redraw without it.

## Design patterns

| Pattern | Where | Why |
|---|---|---|
| Pipeline | The Step's systems | One Step runs an ordered series of independent rules over the Game State, and their order matters (production before Wear, Wear before Sell Orders) |

## Acceptance criteria

- [ ] Effective Stat: base 2 with multipliers 1.5 and 2 and flat bonuses 1 and 0.5 gives 7.5; with no Mods it returns the base.
- [ ] A placed Drill with Rate 1 and Efficiency 0.8 on an Ore Deposit, Advanced 10 s, adds 10 Ore to Storage and removes 12.5 from the Deposit.
- [ ] A Deposit with less left than one Step asks for gives only what it holds times Efficiency, then is removed; the Drill then reports Idle for a missing Deposit and yields nothing.
- [ ] Ore in Storage never exceeds the Ore Storage Cap; at the cap the Drill yields nothing, uses none of its Deposit, and reports Idle for Storage full.
- [ ] Two Drills sharing the last room under the cap split it in id order, the same way on every run.
- [ ] Advancing the same scenario with 5 s Steps ends within 1% of Advancing it with 0.1 s Steps.
- [ ] In the app, after placing the Drill, the Ore amount in the top bar rises, the status light shows Working, and the inspector shows the Effective Stats and Machine Status.
