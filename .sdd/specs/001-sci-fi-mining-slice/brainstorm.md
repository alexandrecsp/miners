# Sci-fi Mining Game: Vertical Slice

## Context

- The project has no code or package.json yet; it holds PROMPT.md, CLAUDE.md (SDD block with check commands `npm test`, `npm run typecheck`, `npm run lint`) and `.sdd/`.
- The project is a git repository on `main`; its first commit is `3eaebe8`.
- `.sdd/config.json` leaves `commit-prefix` unset and sets `pause-between-milestones` to false.
- PROMPT.md proposes the stack: three + @react-three/fiber + drei, postprocessing, optional rapier, zustand + immer, leva, vite.
- PROMPT.md proposes the architecture: data-driven static defs (MachineDef, ResourceDef, UpgradeDef), machine instances with rolled stats and mods, effective stat = base × Π(mult) + Σ(add) as a pure function, a fixed ~10 Hz sim tick outside React, R3F that only reads the store, and a localStorage/IndexedDB save with lastSeen.
- PROMPT.md proposes the visuals: HDRI lighting, PBR materials, dark fog, emissive + bloom, InstancedMesh for many objects, shader-driven beams, HTML/CSS UI overlay, and an orthographic isometric camera.
- PROMPT.md notes that the environment cannot reach asset sites, so the prototype uses procedural geometry and .glb models (Kenney, Quaternius, Poly Pizza, Sketchfab CC) are added later through useGLTF.

## What

1. Purpose: a portfolio piece that must look polished early and be shareable as a link.
2. Genre: an idle/incremental hybrid; machines work on their own while the player decides placement and economics, with no conveyor logistics.
3. Setting: the surface of a planet or moon, seen as an isometric tile grid with ore deposits.
4. Per-instance attributes: each machine's stats (rate, efficiency, durability) are rolled when it is acquired, and each instance also tracks its own condition, wear and mods.
5. Time model: offline progress is computed from lastSeen, capped at 8 hours, with the same wear, storage caps and sell orders as live play, and is shown in a "while you were away" summary.
6. First milestone: a vertical slice of one zone with the full loop (mine → refine → sell → buy/upgrade/repair) and save/load.
7. Platform: desktop browser only, with mouse and keyboard.
8. UI language: English, with text kept in data defs so pt-BR can be added later.
9. Done when: a new player completes the loop in 15 minutes without instructions (place, mine, refine, sell, buy a second machine, upgrade one, repair one); progress survives a reload; and the game holds 60 fps on a mid-range laptop with ~50 machines and a few hundred deposits or rocks.
10. Acquisition: machines are bought from a rotating shop stock of pre-rolled machines, with stats and price visible before buying; the stock refreshes on a timer or for a fee.
11. Wear: a machine's output degrades as its condition drops, and at 0% it breaks and stops until repaired.
12. Refining: the Refinery is a placed machine with its own instance stats that pulls from global storage.
13. Market: resources are sold on a market with fluctuating prices, and nothing is auto-sold.
14. Price behaviour: each price drifts around a base value (mean-reverting), and the player's own sales push it down, after which it recovers over time.
15. Sellable goods: Ore, Crystal and Alloy are all sellable, each with its own price.
16. Storage: each resource (Ore, Crystal, Alloy) has its own upgradeable cap, and producers idle when their output is full.
17. Sell orders: rules such as "sell X when price ≥ P, keep R in reserve" run both live and offline.
18. Deposits: deposits are finite and deplete, and new ones appear over time, so machines get relocated.
19. Slice goal: the slice is an open-ended sandbox with no win condition.
20. Progression: milestone unlocks at thresholds such as credits earned or ore mined; unlocks include the Laser Miner, Refinery mods, storage tiers, more grid area and sell orders.
21. Slice content: the Drill mines Ore (cheap, slow wear); the Laser Miner mines Ore and Crystal (fast, heavy wear, emissive beam); the Refinery makes Alloy (recipes in 24); the resources are Ore, Crystal, Alloy and Credits.
22. Upgrades and mods: mods are bought for credits from a fixed catalogue (UpgradeDefs) and fitted into a limited number of slots on each machine; each mod adds one multiplier or flat bonus to one stat; miner mods are available from the start and Refinery mods unlock later.
23. Removing mods: a fitted mod can be taken off; it goes to a mod inventory and can be fitted on another machine.
24. Refinery recipes: there are two recipes, Ore → Alloy (available from the start) and Ore + Crystal → Alloy (at a better ratio).
25. Recipe choice: the player sets the recipe on each Refinery, and new Refineries start on Ore-only.
26. Deposits: each deposit holds one resource (Ore or Crystal); the Drill fits only on Ore deposits, and the Laser Miner fits on either and mines what the deposit holds.
27. Condition and repair: only condition (0–100%) is stored per machine, and rolled durability sets how fast it drops; a repair is instant, costs credits in proportion to the missing condition and restores it to 100%; lifetime wear makes each later repair cost more.
28. Moving machines: moving a placed machine costs credits, scaled by the distance moved.
29. Starting kit: a new player starts with one free Drill with average stats, waiting to be placed, plus a few credits.
30. Efficiency: for miners, efficiency is resource yielded per unit of deposit used up, so higher efficiency makes a deposit last longer; for the Refinery, it is Alloy produced per unit of input; rate is speed, efficiency is yield.

## How

1. Project: Vite + React + TypeScript (strict), as a multi-file project using npm.
2. 3D assets: procedural geometry for now, behind a model registry keyed by defId, so .glb models can replace procedural ones later through useGLTF without game-code changes.
3. Camera: an orthographic isometric camera at a fixed angle, with pan (drag/WASD) and wheel zoom, clamped to the grid; there is no rotation.
4. State model: a single serialisable `GameState` held in zustand; the sim is a pure `step(state, dt, rng)` run with immer; the UI subscribes with selectors, and R3F reads through `getState()` in `useFrame` without re-renders.
5. Tick: the sim runs on the main thread in a fixed-step 10 Hz accumulator, independent of React; there is no Web Worker.
6. Randomness: a seeded PRNG whose state lives in `GameState` drives stat rolls, shop stock, deposit spawns and price drift, so tests are deterministic and reloads cannot reroll.
7. Save storage: saves go to IndexedDB through idb-keyval, with a `version` field and a migration chain.
8. Save timing: autosave runs every ~10 s, and a save also fires on `visibilitychange → hidden`; losing at most ~10 s is accepted, and there is no localStorage mirror.
9. Offline replay: on return, the same `step` replays offline time (capped at 8 h) at a coarse dt (~5 s) inside a single immer `produce`; there is no closed-form calculation.
10. Core isolation: `src/core/` is pure TS with no imports from react, three or zustand, enforced by ESLint `no-restricted-imports`; it holds the defs, step, formulas, market and save migrations.
11. Testing: Vitest unit tests cover the pure core (stat formula, step, wear, market, sell orders, offline replay, save migrations); there are no rendering or e2e tests.
12. Physics: rapier is dropped from the slice.
13. Grid footprint: every machine takes 1×1; miners must sit on a deposit tile, and refineries on any empty tile.
14. Instancing: terrain tiles, rocks and deposits use InstancedMesh; the ~50 machines are individual meshes.
15. Selection: a selected machine gets the postprocessing Outline effect, and a hovered machine gets an emissive tint.
16. Lighting: a drei `<Environment>` built from procedural `<Lightformer>`s, so no HDRI is downloaded.
17. UI styling: Tailwind v4 through `@tailwindcss/vite`, with the sci-fi palette, fonts and glow defined as `@theme` tokens that the HUD uses.
18. Hosting: GitHub Pages, deployed by a GitHub Action; this needs a git repo and a GitHub remote.
19. Stat formula: effective stat = `base × Π(mult) + Σ(add)`, as a pure function; flat bonuses are not scaled by multipliers.
20. Dev tooling: leva panels plus a cheats panel (add credits, skip N hours, reroll the shop, set a machine's condition), both stripped from production builds.
21. Numbers: plain JS numbers with a display formatter (1.2K, 3.4M); there is no big-number library.
