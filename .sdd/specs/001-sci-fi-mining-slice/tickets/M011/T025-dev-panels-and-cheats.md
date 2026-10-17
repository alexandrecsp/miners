---
id: T025
title: Add development-only leva panels and cheats
milestone: M011
blocked-by: [T015, T024]
status: todo
---

## What to build

In development, the developer gets leva panels for live tuning of the look (bloom, fog, lights) and a cheats panel: add Credits, skip N hours, reroll the Shop, and set the selected Machine's Condition. None of it ships in the production build.

- Cheats in the Game core as pure functions over a Game State: add Credits; skip N hours (Offline Replay of N hours, under the 8-hour cap, with its Away Summary shown); refresh the Shop for free; set a Machine's Condition to a value from 0 to 100 (0 makes it Broken).
- Dev Tools: leva panels for the Scene's tunable look, and a cheats panel calling the cheats through the Game Store, both reached through a dynamic import behind the development-mode flag.

## Design patterns

None

## Acceptance criteria

- [ ] Add Credits raises Credits by the amount and does not change Credits earned.
- [ ] Skip N hours gives the same Game State and Away Summary as Offline Replay of N hours; 10 hours replays 8.
- [ ] The free Shop Refresh replaces the Shop Stock without charging Credits.
- [ ] Setting a Machine's Condition to 0 makes it Broken; to 100 restores it; values outside 0 to 100 are clamped.
- [ ] In `npm run dev`, the leva panels change bloom and fog live and every cheat works from the cheats panel.
- [ ] After `npm run build`, the built files contain no leva code and no cheats panel (checked by searching the build output).
