---
id: T026
title: Hold 60 fps with 50 Machines
milestone: M011
blocked-by: [T025]
status: todo
---

## What to build

A game with about 50 placed Machines and the full set of Deposits and Rocks runs at 60 fps on a mid-range laptop, and the HUD stays responsive. Measure, then remove whatever stops it.

- A development-only frame-rate overlay (drei `Stats`) in the Dev Tools.
- A profiling pass with 50 placed Machines (bought with the add-Credits cheat), fixing what it finds while keeping the visual design: Tiles, Rocks and Deposits each one InstancedMesh; shared geometries and materials across Machines; no state setter in `useFrame`; HUD components on narrow selectors so a Tick does not re-render the whole HUD; device pixel ratio between 1 and 2; shadows and postprocessing within budget.

## Design patterns

None

## Acceptance criteria

- [ ] With 50 placed Machines (Drills, Laser Miners with beams, Refineries), about 170 Deposits and 200 Rocks, the production build (`npm run preview`) holds 60 fps on the development laptop while panning and zooming.
- [ ] React DevTools' profiler shows a Tick re-rendering only the HUD parts whose data changed, not the whole HUD or the Scene's Machine list.
- [ ] Machines of one Machine Def share their geometries and materials.
- [ ] Each of Tiles, Rocks, Ore Deposits and Crystal Deposits is drawn by a single InstancedMesh.
- [ ] The frame-rate overlay appears in `npm run dev` and is absent from the production build.
