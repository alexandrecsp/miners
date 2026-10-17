---
id: T008
title: Sell Resources with Price Impact
milestone: M003
blocked-by: [T005, T007]
status: todo
---

## What to build

The player sells Ore, Crystal or Alloy from the Market panel and receives Credits. Each Sale pushes that Resource's Market Price down, and the drift from T007 brings it back over time. Nothing is ever sold unless the player sells it.

- The Sell Player Action: sells an amount of one Resource from Storage at the current Market Price using the spec's Sale formula with the Resource's market depth (Ore 2,000, Crystal 400, Alloy 400 in the defs); adds the Credits and lowers the Market Price.
- The Sale formula as a Query, so the Market panel can preview the Credits a Sale would earn.
- The Market panel's sell controls per Resource: fixed amounts and "all", each showing the Credits it would earn.

## Design patterns

| Pattern | Where | Why |
|---|---|---|
| Command | Player Actions in the Game core | The HUD and the Scene are untested, so every player intent must reach the core as a plain value through one entry that tests can call |
| Result type | Player Actions and Save loading in the Game core | Expected failures (too few Credits, wrong Tile, unreadable Save) must reach the HUD as a reason to show, not as a thrown error |

## Acceptance criteria

- [ ] Selling `a` units at price `p` with depth `D` adds p × D × (1 − e^(−a/D)) Credits, removes `a` from Storage and leaves the price at p × e^(−a/D).
- [ ] Selling 100 Ore at once earns the same Credits, within rounding, as selling it in ten Sales of 10.
- [ ] Selling more than Storage holds, zero, or a negative amount fails with a reason and changes nothing.
- [ ] After a large Sale, Advancing lets the Market Price recover towards its Base Price.
- [ ] Advancing a game with Ore in Storage and no Sale never changes the Ore amount through selling.
- [ ] In the app, selling Ore from the Market panel raises Credits by the previewed amount and visibly lowers the Ore Market Price, which then recovers.
