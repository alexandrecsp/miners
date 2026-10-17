---
id: T022
title: Set Sell Orders that sell on their own
milestone: M009
blocked-by: [T018]
status: todo
---

## What to build

Once the Sell Orders Unlock is earned, the player opens the Sell Orders panel and sets, per Resource, a minimum price and a Reserve. Every Step, each Sell Order sells as much of the Resource above its Reserve as it can while keeping the Market Price at or above its minimum. The player can change or clear a Sell Order at any time.

- The Sell Orders in the Game State: per Resource at most one, with its minimum price and Reserve.
- The Set Sell Order and Clear Sell Order Player Actions. Setting requires the Sell Orders Unlock, a minimum price above zero and a Reserve of zero or more; setting a Resource that already has one replaces it.
- The Sell Orders system in the Step, after Wear and before Unlocks: when the Market Price `p` is at or above the minimum `P`, sell min(amount − Reserve, D × ln(p/P)) through the same Sale rule as the Sell action, adding to Credits and the Lifetime Counters.
- The Sell Orders panel, shown once the Unlock is earned: per Resource, the current order, inputs for minimum price and Reserve, and a clear button.

## Design patterns

| Pattern | Where | Why |
|---|---|---|
| Command | Player Actions in the Game core | The HUD and the Scene are untested, so every player intent must reach the core as a plain value through one entry that tests can call |
| Result type | Player Actions and Save loading in the Game core | Expected failures (too few Credits, wrong Tile, unreadable Save) must reach the HUD as a reason to show, not as a thrown error |
| Pipeline | The Step's systems | One Step runs an ordered series of independent rules over the Game State, and their order matters (production before Wear, Wear before Sell Orders) |

## Acceptance criteria

- [ ] Setting a Sell Order before its Unlock fails with a reason; after it, a valid order is stored and replaces any earlier one on that Resource.
- [ ] With 500 Ore, a Reserve of 100 and the Market Price above the minimum, a Step sells Ore down to 100 or until the price reaches the minimum, whichever comes first, and never below either.
- [ ] With the Market Price below the minimum, nothing is sold.
- [ ] Credits and the Lifetime Counters rise by what the Sell Order sold, exactly as a manual Sale of that amount would.
- [ ] A cleared Sell Order sells nothing more.
- [ ] Over one hour with a Drill and a Sell Order, 5 s Steps sell within 2% of what 0.1 s Steps sell.
- [ ] In the app, a Sell Order on Ore keeps Ore near its Reserve while Credits rise without manual Sales.
