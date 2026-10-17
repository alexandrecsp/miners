---
id: T009
title: Fill the Shop Stock with pre-rolled Offers
milestone: M004
blocked-by: [T004]
status: todo
---

## What to build

The player opens the Shop and sees four Offers, each a Machine whose Base Stats were rolled in advance, with the roll and the price on show. The Shop Stock is replaced on a timer, with a countdown, or at once for 20 Credits.

- The Stat Roll: each Base Stat drawn uniformly within its Machine Def's range from the Rng; the roll quality as the spec defines it.
- The Offer price formula: the Machine Def's base price × (0.7 + 0.6 × roll quality), rounded up to whole Credits.
- Shop Stock generation: 4 Offers, at least one of each available Machine Def (the Drill and the Refinery; availability is a def flag the Laser Miner's Unlock will change in T018), the rest drawn at random from the available Machine Defs. Each Offer holds a fully rolled Machine with 100% Condition, so buying it later reveals nothing new.
- The Shop timer system in the Step: when the sim clock passes the next timed Shop Refresh (every 180 s), replace the Shop Stock and schedule the next one. New game fills the first Shop Stock.
- The Refresh Shop Player Action: costs 20 Credits and replaces the Shop Stock; it does not move the timer.
- The Shop panel: each Offer's Machine Def name, its Base Stats shown against their ranges, and its price; the countdown to the next timed Shop Refresh; the paid refresh button with its cost.

## Design patterns

| Pattern | Where | Why |
|---|---|---|
| Command | Player Actions in the Game core | The HUD and the Scene are untested, so every player intent must reach the core as a plain value through one entry that tests can call |
| Result type | Player Actions and Save loading in the Game core | Expected failures (too few Credits, wrong Tile, unreadable Save) must reach the HUD as a reason to show, not as a thrown error |
| Pipeline | The Step's systems | One Step runs an ordered series of independent rules over the Game State, and their order matters (production before Wear, Wear before Sell Orders) |
| Dependency Injection | The Rng in the Step, the current time in Offline Replay and Save serialisation, the Migration list in Save loading | Tests must force random outcomes, times and Migrations without global state |

## Acceptance criteria

- [ ] Every rolled Base Stat lies inside its Machine Def's range; a scripted Rng returning 0 rolls every Stat at its minimum and one returning just under 1 rolls them near their maximum.
- [ ] Roll quality 0 prices an Offer at 70% of its base price, quality 1 at 130%, rounded up to whole Credits.
- [ ] A new game's Shop Stock holds 4 Offers, with at least one Drill and one Refinery, and no Laser Miner.
- [ ] Advancing past 180 s replaces the Shop Stock and schedules the next timed Shop Refresh 180 s later.
- [ ] Refresh Shop with 20 or more Credits replaces the Shop Stock and costs 20 Credits; with fewer it fails with a reason and changes nothing.
- [ ] The same seed gives the same Shop Stocks.
- [ ] In the app, the Shop panel shows four Offers with their Base Stats, ranges and prices, a countdown, and a working paid refresh button.
