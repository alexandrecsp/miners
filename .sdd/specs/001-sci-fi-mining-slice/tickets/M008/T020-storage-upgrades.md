---
id: T020
title: Buy Storage Upgrades to unlocked Storage Tiers
milestone: M008
blocked-by: [T018]
status: todo
---

## What to build

The player opens the Storage panel and, for each Resource separately, buys a Storage Upgrade to the next Storage Tier once that tier is unlocked, raising that Resource's Storage Cap. Producers that were Idle for Storage full resume.

- Storage Tier caps from the defs: tier 1 Ore 200, Crystal 100, Alloy 100; each higher tier × 2.5, up to tier 5.
- The next Storage Upgrade Query per Resource: the next tier, its cap, its cost (tiers 2, 3, 4, 5 cost 100, 400, 1,500, 6,000 Credits) and whether its Unlock is earned.
- The Buy Storage Upgrade Player Action for one Resource: requires the next tier's Unlock, pays its cost, raises that Resource's Storage Tier by one.
- The Storage panel: per Resource, the amount, the Storage Cap, the next tier's cap and cost, and the Unlock it waits for when locked.

## Design patterns

| Pattern | Where | Why |
|---|---|---|
| Command | Player Actions in the Game core | The HUD and the Scene are untested, so every player intent must reach the core as a plain value through one entry that tests can call |
| Result type | Player Actions and Save loading in the Game core | Expected failures (too few Credits, wrong Tile, unreadable Save) must reach the HUD as a reason to show, not as a thrown error |

## Acceptance criteria

- [ ] With Storage Tier 2 unlocked and 100 Credits, upgrading Ore raises the Ore Storage Cap from 200 to 500, costs 100 Credits, and leaves Crystal and Alloy unchanged.
- [ ] Upgrading to a tier whose Unlock is not earned, with too few Credits, or past tier 5 fails with a reason and changes nothing.
- [ ] A Drill Idle for Storage full works again on the Step after its Resource's upgrade.
- [ ] In the app, the Storage panel shows each Resource's next tier, cost and lock state, and buying an upgrade raises the cap shown in the top bar.
