---
id: T024
title: Replay Offline Progress and show the Away Summary
milestone: M010
blocked-by: [T023]
status: todo
---

## What to build

A player who comes back after closing the game, or to a tab that was hidden, finds up to 8 hours of Offline Progress applied under the live rules, and an Away Summary dialog says what was mined, refined and sold, the Credits earned, which Machines broke, which Deposits ran out and what was unlocked.

- Offline Replay in the Game core: given a Game State and the current real time (or a gap length), Advance by the time since Last Seen (or the gap), capped at 8 hours, with 5 s Steps inside a single immer `produce`, and return the next Game State with an Away Summary. A time not after Last Seen replays nothing.
- The Away Summary: the time replayed and whether the cap cut it, built by comparing the Game State before and after: per Resource mined, refined and sold, Credits earned, the Machines that became Broken, the Deposits depleted and the Unlocks earned.
- Boot: after a Save loads, Offline Replay from Last Seen runs before the Sim Loop starts.
- The Sim Loop: on return to a visible page, and for any gap that Fixed-step pacing returns, the time since the last Tick goes to Offline Replay.
- The UI Store holds the Away Summary to show; the HUD shows it as a dismissable dialog when the replayed time is at least 60 s.

## Design patterns

| Pattern | Where | Why |
|---|---|---|
| Dependency Injection | The Rng in the Step, the current time in Offline Replay and Save serialisation, the Migration list in Save loading | Tests must force random outcomes, times and Migrations without global state |

## Acceptance criteria

- [ ] Offline Replay of 2 hours with a placed Drill adds the Ore that Advancing 2 hours with 0.1 s Steps adds, within 2%, including Wear and the Storage Cap.
- [ ] Offline Replay of 20 hours replays exactly 8 hours, and the Away Summary says the cap cut it.
- [ ] Sell Orders run during Offline Replay, and the Away Summary's sold amounts and Credits earned match the change in the Lifetime Counters.
- [ ] A Machine that breaks during Offline Replay is listed in the Away Summary and is Broken afterwards; a Deposit that runs out is listed as depleted.
- [ ] An Unlock earned during Offline Replay is listed and in effect afterwards.
- [ ] A current time at or before Last Seen changes nothing and gives an empty Away Summary.
- [ ] The same Game State and time give the same result twice.
- [ ] In the app, closing the game for over a minute and reopening it shows the Away Summary with progress applied, and returning to a tab hidden for over a minute shows it too; a reload after a few seconds shows none.
