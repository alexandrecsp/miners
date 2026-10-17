---
id: T006
title: Spawn new Deposits over time
milestone: M002
blocked-by: [T005]
status: done
---

## What to build

New Deposits appear over time on Empty Tiles inside the Unlocked Area, so a player whose Deposits deplete finds new ones to mine. They appear in the Scene as they spawn.

- The Deposit spawn system in the Step, as the spec describes: the next spawn time is stored in the Game State and drawn from the Rng with an average of 30 s; on reaching it, a new Deposit (75% Ore, 25% Crystal, remaining amount within its def's range) goes on a random Empty Tile in the Unlocked Area while the Unlocked Area holds fewer than one Deposit per 12 Tiles; the next spawn time is then drawn.
- New game sets the first spawn time.

## Design patterns

| Pattern | Where | Why |
|---|---|---|
| Pipeline | The Step's systems | One Step runs an ordered series of independent rules over the Game State, and their order matters (production before Wear, Wear before Sell Orders) |
| Dependency Injection | The Rng in the Step, the current time in Offline Replay and Save serialisation, the Migration list in Save loading | Tests must force random outcomes, times and Migrations without global state |

## Acceptance criteria

- [ ] Advancing past the next spawn time adds exactly one Deposit, on an Empty Tile inside the Unlocked Area, with a remaining amount inside its def's range, and sets a later next spawn time.
- [ ] A new Deposit never lands on a Rock, a Deposit, a Machine or a Tile outside the Unlocked Area.
- [ ] With the Unlocked Area at its Deposit limit, passing the spawn time adds no Deposit.
- [ ] A scripted Rng forces a Crystal Deposit, and another forces an Ore Deposit.
- [ ] Advancing one hour from a new game with the same seed twice gives equal Deposit sets.
- [ ] One 5 s Step that passes the spawn time spawns the Deposit just as 0.1 s Steps do, and a Step that passes several spawn times (forced by a scripted Rng) spawns one Deposit for each.
- [ ] In the app, new Deposits appear in the Unlocked Area while playing.
