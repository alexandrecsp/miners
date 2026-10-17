---
id: T018
title: Earn Unlocks from Lifetime Counters
milestone: M008
blocked-by: [T008, T009, T012]
status: todo
---

## What to build

The game tracks Lifetime Counters and grants Unlocks when they reach their thresholds. The player sees each Unlock's progress in an Unlocks panel and gets a notice the moment one is earned. The first Unlock with a visible effect is the Laser Miner: once earned, Laser Miner Offers appear in the Shop Stock.

- The Lifetime Counters in the Game State: Credits earned from Sales, and per Resource the amount mined, refined (Alloy) and sold. Mining, Refining and Sales add to them.
- The Unlock defs from the spec, each with its Lifetime Counter, threshold and effect: Storage Tier 2 at 300 Ore mined; Laser Miner at 600 Credits earned; Sell Orders at 1,500 Credits earned; Refinery Mods at 100 Alloy refined; Unlocked Area 18 × 18 at 3,000 Ore mined; Storage Tier 3 at 5,000 Credits earned; Unlocked Area 24 × 24 at 1,000 Crystal mined; Storage Tier 4 at 25,000 Credits earned; Unlocked Area 32 × 32 at 60,000 Credits earned; Storage Tier 5 at 150,000 Credits earned.
- The earned Unlock ids in the Game State, and the Unlocks system as the last system of the Step: it earns every Unlock whose threshold its Lifetime Counter has reached. Features read the earned Unlocks to decide what is available; this ticket wires the Laser Miner's (Machine Def availability for the Shop Stock). Storage Tiers, Unlocked Area, Refinery Mods and Sell Orders read theirs in T020, T021 and T022.
- The Unlock progress Query.
- The Unlocks panel (earned Unlocks, and the next ones with their progress) and a notice when an Unlock is earned, detected by the HUD comparing the earned Unlocks it last saw.

## Design patterns

| Pattern | Where | Why |
|---|---|---|
| Pipeline | The Step's systems | One Step runs an ordered series of independent rules over the Game State, and their order matters (production before Wear, Wear before Sell Orders) |

## Acceptance criteria

- [ ] Mining, Refining and Sales add exactly the mined, refined, sold and earned amounts to the Lifetime Counters; Repairs and purchases never lower them.
- [ ] Reaching 600 Credits earned earns the Laser Miner Unlock on that Step, once; spending Credits afterwards does not remove it.
- [ ] A Lifetime Counter that passes two thresholds in one Step earns both Unlocks.
- [ ] Before the Laser Miner Unlock no Shop Stock holds a Laser Miner; after it, every new Shop Stock holds at least one.
- [ ] The Unlock progress Query reports each unearned Unlock's counter value and threshold.
- [ ] In the app, the Unlocks panel shows progress rising, a notice appears when the Laser Miner Unlock is earned, and the next Shop Refresh offers a Laser Miner.
