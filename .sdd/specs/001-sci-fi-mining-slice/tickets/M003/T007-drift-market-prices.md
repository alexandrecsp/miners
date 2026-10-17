---
id: T007
title: Drift Market Prices around their Base Prices
milestone: M003
blocked-by: [T003]
status: todo
---

## What to build

Market Prices for Ore, Crystal and Alloy move on their own, drifting around their Base Prices, and the player watches them in a Market panel and in the top bar.

- The Market drift system in the Step, as the spec describes: a mean-reverting random walk per Resource using the exact discretisation for `dt` (reversion half-life about 120 s, typical deviation about 15% of the Base Price, normal draws from the Rng), floored at 20% of the Base Price. Base Prices and the drift numbers live in the Resource defs.
- The Market panel listing each Resource's Market Price (price mode of the display formatter) and its Base Price, with a small up or down indicator against the previous value.

## Design patterns

| Pattern | Where | Why |
|---|---|---|
| Pipeline | The Step's systems | One Step runs an ordered series of independent rules over the Game State, and their order matters (production before Wear, Wear before Sell Orders) |
| Dependency Injection | The Rng in the Step, the current time in Offline Replay and Save serialisation, the Migration list in Save loading | Tests must force random outcomes, times and Migrations without global state |

## Acceptance criteria

- [ ] Over 24 sim hours of Advancing, each Market Price's mean stays within 5% of its Base Price and it never falls below 20% of its Base Price.
- [ ] A Market Price set to half its Base Price is back within 10% of it after 10 minutes on average (over many seeds), and a price above the Base Price falls back the same way.
- [ ] The spread of prices over 24 sim hours with 5 s Steps is within 20% of the spread with 0.1 s Steps.
- [ ] The same seed gives the same price path.
- [ ] In the app, the Market panel and the top bar show prices that change over time and stay near their Base Prices.
