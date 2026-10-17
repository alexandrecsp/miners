---
id: T002
title: Generate a new game and run the Sim Loop
milestone: M001
blocked-by: [T001]
status: done
---

## What to build

A new game exists and time passes in it. The Game core gains the Game State, the Rng, New game, the Step with its first system, Advance and Fixed-step pacing; the Game Store holds the Game State and the Sim Loop ticks it at 10 Hz outside React. The placeholder page shows the sim clock and Credits updating.

- The Game State as the spec lists it, with the fields this ticket needs: Save Version 1, Last Seen, sim clock, generator state, id counter, Credits, Storage (amount 0 and Storage Tier 1 per Resource), the Grid with its Deposits and Rocks, the Machines, an empty Mod Inventory, and Market Prices at their Base Prices. Later tickets add the rest.
- The Rng interface and the production Rng: a small seeded generator whose state is the Game State's generator field.
- New game from a seed: the 32 × 32 Grid, the central 12 × 12 Unlocked Area, about 120 Ore Deposits, 50 Crystal Deposits and 200 Rocks over the whole Grid with at least 6 Ore and 2 Crystal Deposits inside the Unlocked Area and never two on one Tile; the Starting Kit (a Drill with mid-range Base Stats and 100% Condition in the Machine Inventory, and 50 Credits). The Machine Defs, Resource defs and balance numbers from the spec live in the defs.
- The Step as a Pipeline whose first system is the Clock; Advance runs Steps inside one immer `produce`.
- Fixed-step pacing: whole 0.1 s Ticks from an accumulator, at most 10 per call, and a gap returned instead when one call's elapsed time exceeds 1 s.
- The Game Store (zustand) and the Sim Loop (a 100 ms interval that stops when the page is hidden and restarts when visible). Until Offline Replay exists (T024), a returned gap is dropped.

## Design patterns

| Pattern | Where | Why |
|---|---|---|
| Pipeline | The Step's systems | One Step runs an ordered series of independent rules over the Game State, and their order matters (production before Wear, Wear before Sell Orders) |
| Dependency Injection | The Rng in the Step, the current time in Offline Replay and Save serialisation, the Migration list in Save loading | Tests must force random outcomes, times and Migrations without global state |

## Acceptance criteria

- [ ] New game with the same seed twice gives equal Game States; two different seeds give different Deposit layouts.
- [ ] New game places the Deposit and Rock counts the defs ask for, never two on one Tile, with at least 6 Ore and 2 Crystal Deposits inside the Unlocked Area.
- [ ] New game gives a Starting Kit of exactly one Drill in the Machine Inventory, with every Base Stat at the middle of its range and 100% Condition, and 50 Credits.
- [ ] The Game State survives a JSON round trip unchanged.
- [ ] Advancing 1 s with 0.1 s Steps moves the sim clock by 1 s; Advancing 7.5 s with 5 s Steps moves it by 7.5 s.
- [ ] Fixed-step pacing turns 250 ms into 2 Ticks and keeps 50 ms, carries the remainder across calls, never returns more than 10 Ticks, and returns the full elapsed time as a gap when one call sees more than 1 s.
- [ ] Drawing from the production Rng changes the stored generator state, and the same stored state always yields the same next draw.
- [ ] In `npm run dev`, the page shows the sim clock advancing about one second per second.
