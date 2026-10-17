---
base-commit: 3eaebe8eace67e0a9983b5b14295beee1215ac16
---

# Sci-fi Mining Game: Vertical Slice

## Problem Statement

The author wants a portfolio piece: a browser game, shareable as a link, that looks polished from the first screen and shows real systems design. Nothing exists yet beyond a brief. The game is an idle/incremental hybrid about mining on a planet's surface, where every Machine is an individual with its own rolled Stats, Condition and Mods, and the player's job is placement and economics, not logistics. A visitor who opens the link must understand the loop without instructions, and must find their progress waiting when they come back, including what happened while they were away.

## Solution

A desktop-browser game in Vite, React and TypeScript, rendering one Zone as an isometric Grid of Tiles with Ore and Crystal Deposits under sci-fi lighting, emissive glow and bloom. The player places a free Drill from the Starting Kit, mines Ore into Storage, sells it on a Market whose prices drift and react to the player's Sales, buys pre-rolled Machines from a rotating Shop, refines Ore (and later Crystal) into Alloy in a Refinery, fits Mods, Repairs worn Machines, Moves Machines as Deposits deplete, and earns Unlocks: the Laser Miner, Refinery Mods, Storage Tiers, more Unlocked Area and Sell Orders. All rules live in a pure core simulation over one Game State, saved to IndexedDB; on return, the same rules replay up to 8 hours of Offline Progress and an Away Summary reports it. The slice is an open sandbox with no win condition, deployed to GitHub Pages.

## User Stories

World and camera

1. As a player, I want to see the Zone as an isometric Grid of Tiles with Deposits and Rocks under dark, glowing sci-fi lighting, so that the game looks polished from the first screen.
2. As a player, I want to pan the camera by dragging or with WASD and zoom with the mouse wheel, kept within the Grid, so that I can look around without getting lost.
3. As a player, I want to tell Ore Deposits, Crystal Deposits, Rocks and the Tiles outside the Unlocked Area apart at a glance, so that I know where Machines can go.

Starting and placing

4. As a new player, I want to start with one free Drill with average Stats waiting in my Machine Inventory and a few Credits, so that I can begin playing straight away.
5. As a player, I want to choose a Machine from my Machine Inventory and see which Tiles accept it highlighted, so that I can place it without trial and error.
6. As a player, I want a Miner's Placement to succeed only on a Deposit it can mine, and a Refinery's only on an Empty Tile, both inside the Unlocked Area, so that the rules of the Grid are clear.
7. As a player, I want a failed action to tell me why it failed, so that I can correct it.
8. As a player, I want a Machine to tint when I hover it and show an outline when I select it, with its details in an inspector, so that I know what I am acting on.

Mining and storage

9. As a player, I want a placed Miner to yield its Resource into Storage at its Effective Rate, so that my Machines work on their own.
10. As a player, I want a Miner's Efficiency to decide how much Deposit each unit of yield uses up, so that efficient Machines make Deposits last longer.
11. As a player, I want Deposits to deplete and disappear, and new Deposits to appear over time in the Unlocked Area, so that I must Move Machines to keep mining.
12. As a player, I want each Resource to have its own Storage Cap, and Machines whose output is full to go Idle, so that Storage is a decision I manage.
13. As a player, I want to see each Machine's Machine Status (Working, Idle with its reason, or Broken), so that I can spot problems.
14. As a player, I want every Resource amount, cap, price and cost shown in a compact format (1.2K, 3.4M), so that large numbers stay readable.

Market

15. As a player, I want to sell Ore, Crystal and Alloy on the Market, each at its own Market Price, so that I turn Resources into Credits.
16. As a player, I want Market Prices to drift around their Base Prices over time, so that timing my Sales matters.
17. As a player, I want my Sales to push the Market Price down and the price to recover over time, so that dumping everything at once is a poor choice.
18. As a player, I want nothing to be sold unless I sell it or a Sell Order does, so that I stay in control of my Resources.

Shop and Moves

19. As a player, I want to buy Machines from a Shop Stock of Offers whose Base Stats and price I can see before buying, so that I can judge each Machine.
20. As a player, I want every Machine's Base Stats rolled within its Machine Def's ranges, with better rolls costing more, so that each Machine is an individual.
21. As a player, I want the Shop Stock to refresh on a timer, or at once for a fee, so that I can hunt for a better Offer.
22. As a player, I want a bought Machine to go to my Machine Inventory, ready for Placement, so that I can place it where I choose.
23. As a player, I want to Move a placed Machine to another Tile for a Credits cost that grows with the distance, so that I can follow new Deposits.

Refining

24. As a player, I want to place a Refinery that turns Resources from Storage into Alloy at its Effective Rate and Efficiency, so that I can add value to my Ore.
25. As a player, I want to choose each Refinery's Recipe, Ore to Alloy or Ore plus Crystal to Alloy at a better ratio, with new Refineries starting on Ore to Alloy, so that I can use my Crystal.
26. As a player, I want a Refinery to go Idle when its inputs are missing or Alloy Storage is full, so that it never consumes Resources it cannot turn into Alloy.

Wear and Repair

27. As a player, I want a Working Machine to lose Condition at a pace set by its Durability, and its output to fall as Condition falls, so that upkeep matters.
28. As a player, I want a Machine at 0% Condition to be Broken and stop until I Repair it, so that neglect has a cost.
29. As a player, I want to Repair a Machine instantly to 100% for Credits in proportion to the missing Condition, costing more as its Lifetime Wear grows, so that old Machines slowly become worth replacing.

Mods

30. As a player, I want to buy Mods from a fixed Mod Catalogue, so that I can improve my Machines.
31. As a player, I want to fit a Mod into a free Mod Slot of a Machine it fits, so that it changes one Effective Stat by a multiplier or a flat bonus.
32. As a player, I want to see Effective Stats computed as the Base Stat times the product of multipliers plus the sum of flat bonuses, so that Mods are predictable.
33. As a player, I want to remove a fitted Mod to my Mod Inventory and fit it on another Machine, so that Mods are never wasted.
34. As a player, I want miner Mods available from the start and Refinery Mods available after an Unlock, so that the Mod Catalogue grows with me.

Progression

35. As a player, I want Unlocks to arrive when Lifetime Counters such as Credits earned or Ore mined reach their thresholds, and to see what is next, so that I always have a goal.
36. As a player, I want the Laser Miner, once unlocked, to appear in the Shop and to mine Ore or Crystal Deposits fast with heavy Wear and a glowing beam, so that I can reach Crystal.
37. As a player, I want to buy Storage Upgrades to the Storage Tiers I have unlocked, separately for each Resource, so that I can hold more.
38. As a player, I want the Unlocked Area to grow through Unlocks, so that I gain room and Deposits.
39. As a player, I want a notice when I earn an Unlock, so that I notice new options.

Sell Orders

40. As a player, once Sell Orders are unlocked, I want to set a Sell Order on a Resource ("sell when the price is at least P, keep R in Reserve") and clear it, so that selling runs without me.
41. As a player, I want Sell Orders to run in live play and during Offline Progress alike, so that my rules hold while I am away.

Saving and Offline Progress

42. As a player, I want my progress saved automatically and restored when I reload, so that I never lose more than a few seconds.
43. As a player, I want to come back after closing the game and find up to 8 hours of Offline Progress applied under the same rules as live play (Wear, Storage Caps, Sell Orders), so that the game kept running.
44. As a player, I want an Away Summary of what was mined, refined and sold, what Credits I earned, which Machines broke and what I unlocked while I was away, so that I understand what changed.
45. As a player, I want the same to apply when I return to a tab that was hidden, so that switching tabs behaves like leaving.
46. As a returning player, I want an old Save to keep loading after the game is updated, so that updates do not wipe my progress.

Dev, sharing and performance

47. As the developer, I want debug panels and cheats (add Credits, skip N hours, reroll the Shop, set a Machine's Condition) in development only, so that I can test the loop fast without shipping them.
48. As the author, I want each push to `main` to build and deploy the game to GitHub Pages, so that I can share it as a link.
49. As a player on a mid-range laptop, I want the game to hold 60 fps with about 50 Machines and a few hundred Deposits and Rocks, so that it feels smooth.
50. As a translator later, I want every player-facing text kept in data, so that pt-BR can be added without touching game code.

## Implementation Decisions

### Project and tooling

- Vite, React and TypeScript in strict mode, as a multi-file npm project. Scripts: `dev`, `build`, `preview`, `test` (Vitest, single run), `typecheck` (TypeScript with no emit), `lint` (ESLint flat config).
- The Vite base path is relative so the build works under any GitHub Pages repository path.
- Dependencies: three, @react-three/fiber, @react-three/drei, @react-three/postprocessing (with postprocessing), zustand, immer, idb-keyval, leva (development only), Tailwind v4 through `@tailwindcss/vite`. rapier is not used.
- Fonts are bundled from npm font packages, not loaded from a runtime CDN.
- A GitHub Actions workflow on push to `main` runs the three check commands, builds, and deploys the build to GitHub Pages. The repository has no GitHub remote yet; the author adds it and enables Pages.

### Layers

The code has one core and four outer layers that depend on it, never the reverse.

- **Game core**: pure TypeScript holding the defs, the Game State type, the Step and its systems, the Player Actions, the formulas, the Market, Offline Replay, the save Migrations, the display formatter, the string table and the cheats. ESLint `no-restricted-imports` forbids it from importing react, react-dom, three, @react-three/*, zustand, leva and idb-keyval, and `no-restricted-globals`/`no-restricted-properties` forbid `Math.random`, `Date.now`, `performance.now`, `window`, `document` and `localStorage` there. It may use immer.
- **Game Store**: a zustand store holding the Game State. It exposes `dispatch(action)`, which applies a Player Action through the Game core and, on failure, publishes the failure reason for the HUD to show as a notice. Only the Sim Loop, `dispatch`, the boot sequence and the dev cheats replace its Game State.
- **UI Store**: a separate zustand store for view state that is never saved: the selected Machine, the hovered Tile, the interaction mode (none, placing a Machine, moving a Machine, fitting a Mod), open panels, pending notices and the Away Summary to show.
- **Sim Loop**: a 100 ms interval timer outside React that feeds real elapsed time into the Game core's fixed-step pacing and advances the Game State by whole Ticks. It stops when the page is hidden and restarts when it is visible again.
- **Persistence**: the IndexedDB adapter over idb-keyval, the autosave schedule and the boot sequence.
- **Scene**: the R3F canvas. It reads the Game State through selectors for what changes rarely (which Machines exist and where) and through `getState()` inside `useFrame` for what changes every Tick (Machine Status lights, beams, Condition tint). It never calls a state setter inside `useFrame`.
- **HUD**: the HTML overlay, styled with Tailwind. Components subscribe to narrow selectors so a Tick re-renders only what changed.
- **Dev Tools**: leva panels and the cheats panel, loaded through a dynamic import behind the development-mode flag so production builds contain neither.

### Game core interface

The Game core is the one seam the tests use. Its interface:

- **New game**: given a seed, returns the initial Game State: the generated Grid, the Starting Kit, a first Shop Stock and starting Market Prices.
- **Apply a Player Action**: given a Game State and a Player Action value, returns either the next Game State or a failure with a reason id. It never throws for an expected failure, and a failure leaves the Game State unchanged.
- **Step**: `step(state, dt, rng)` applies every rule for `dt` seconds to an immer draft. `rng` is an Rng (an interface with one draw method returning a number in [0, 1)). The production Rng is a small seeded generator whose state is the Game State's generator field, so drawing advances the stored state; tests may pass a scripted Rng to force an outcome.
- **Advance**: given a Game State, a total length of time and a Step length, runs as many Steps as fit (the last one shorter if needed) inside a single immer `produce`, using the production Rng, and returns the next Game State. A live Tick is an Advance of 0.1 s; Offline Replay is an Advance with 5 s Steps.
- **Fixed-step pacing**: given an accumulator and a real elapsed time, returns how many Ticks to run now, the new accumulator, and any gap to hand to Offline Replay. At most 10 Ticks run per call; when a single call's elapsed time exceeds 1 s, the whole elapsed time becomes a gap instead.
- **Offline Replay**: given a Game State and the current real time, Advances by the time since Last Seen (or a given gap), capped at 8 hours, and returns the next Game State with an Away Summary.
- **Queries**: pure reads of a Game State used by the HUD and the Scene: the Effective Stats of a Machine, its Machine Status, the Repair cost, the Move cost to a Tile, whether a Machine may be placed or moved to a Tile (the same check the Player Actions use, so highlighted Tiles always agree with the rules), the Offer prices, the next Storage Upgrade and its cost, and the progress towards each Unlock.
- **Effective Stat**: the pure formula, Base Stat times the product of the multipliers plus the sum of the flat bonuses. Flat bonuses are not multiplied. With no Mods it returns the Base Stat.
- **Save**: serialise a Game State with the current real time into a Save record (Last Seen set to that time, Save Version set to the current version); load a raw stored value into a Game State by running the Migration chain, or return a failure for a value that is not a Save, a Save Version newer than the game knows, or a Migration that fails.
- **Display formatter**: formats a number for the player; whole numbers below 1,000; one decimal with K, M, B and T suffixes from 1,000 up; scientific notation past the T range; a price mode with two decimals for values below 100.
- **Strings**: an English string table keyed by stable string ids. Defs name their text by string id, and failure reasons are string ids.
- **Cheats**: pure functions over a Game State: add Credits, skip N hours (an Offline Replay of N hours, under the same cap), refresh the Shop for free, set a Machine's Condition.

### Game State

One plain, JSON-serialisable object. No class instances, Maps, Sets, Dates or functions. Ids are strings made from a counter stored in the Game State, never random. It holds:

- the Save Version, Last Seen (real time in milliseconds), the sim clock (sim seconds elapsed), the generator state and the id counter;
- Credits;
- Storage: per Resource, the amount and the Storage Tier;
- the Grid: its full size, the Unlocked Area size, the Deposits (id, Tile, Resource, remaining amount), the Rocks (Tiles) and the time of the next Deposit spawn;
- the Machines: id, Machine Def id, Base Stats (Rate, Efficiency, Durability), Condition, Lifetime Wear, the fitted Mod Def ids by Mod Slot, the Tile or nothing for the Machine Inventory, and for a Refinery its Recipe id;
- the Mod Inventory: Mod Def ids with counts;
- the Shop: the Offers (each a fully rolled Machine waiting to be bought, with its price) and the time of the next timed Shop Refresh;
- the Market: per Resource, the Market Price;
- the Sell Orders: per Resource, at most one, with its minimum price and Reserve;
- the Lifetime Counters: Credits earned from Sales, and per Resource the amount mined, refined (Alloy) and sold;
- the earned Unlock ids.

Resource amounts are fractional numbers; the HUD floors them for display.

### Player Actions

Each is a value with a kind and its fields. Each checks its rules and returns a failure reason when one is broken.

- Place a Machine from the Machine Inventory on a Tile. Free.
- Move a placed Machine to another Tile, paying the Move cost.
- Buy an Offer, paying its price; the Machine joins the Machine Inventory with 100% Condition and the Offer leaves the Shop Stock.
- Refresh the Shop for a fee.
- Sell an amount of a Resource (the HUD offers fixed amounts and "all").
- Set a Refinery's Recipe.
- Repair a Machine, paying the Repair cost. Fails when the Condition is already 100%.
- Buy a Mod from the Mod Catalogue into the Mod Inventory.
- Fit a Mod from the Mod Inventory into a free Mod Slot of a Machine it fits (placed or in the Machine Inventory).
- Remove the Mod in a Mod Slot back into the Mod Inventory. Free.
- Buy a Storage Upgrade for a Resource to its next unlocked Storage Tier.
- Set or clear the Sell Order on a Resource.

Placement and Move rules: the target Tile is inside the Unlocked Area and holds no Machine; a Drill needs an Ore Deposit; a Laser Miner needs an Ore or Crystal Deposit; a Refinery needs an Empty Tile. A Move to the Machine's own Tile fails.

### The Step

The Step runs these systems in this order on the draft, each scaling every time-based quantity by `dt` so a 5 s Step gives nearly the same result as fifty 0.1 s Steps:

1. **Clock**: advance the sim clock.
2. **Market drift**: each Market Price follows a mean-reverting random walk towards its Base Price, using the exact discretisation for `dt` (reversion half-life about 120 s, typical deviation about 15% of the Base Price, normal draws from the Rng), floored at 20% of the Base Price. The same reversion is how prices recover from Price Impact.
3. **Shop timer**: when the sim clock passes the next timed Shop Refresh, replace the Shop Stock and schedule the next one.
4. **Deposit spawn**: for each spawn time the sim clock passes, place a new Deposit on a random Empty Tile in the Unlocked Area if the Unlocked Area is below its Deposit limit, then draw the next spawn time.
5. **Mining**: each placed, non-Broken Miner on a Deposit it can mine yields up to Effective Rate × output factor × `dt`, limited by the room left under the Storage Cap and by what the Deposit can give (remaining amount × Effective Efficiency). The Deposit loses yield ÷ Effective Efficiency; a Deposit at zero is removed.
6. **Refining**: each placed, non-Broken Refinery processes up to Effective Rate × output factor × `dt` batches of its Recipe, limited by the inputs in Storage and by the room under the Alloy Storage Cap; it removes the inputs and adds batches × Recipe Alloy × Effective Efficiency.
7. **Wear**: each Machine that produced in this Step loses Condition at its Machine Def's wear rate ÷ Effective Durability, times `dt`, times the share of its potential output it actually produced (potential output being what it would produce in the Step at its current Condition with no Storage, Deposit or input limit). Condition never goes below 0%; at 0% the Machine is Broken. Lifetime Wear grows by the Condition lost.
8. **Sell Orders**: for each Sell Order whose Resource's Market Price is at or above its minimum, sell the largest amount above the Reserve that keeps the Market Price at or above the minimum after Price Impact.
9. **Unlocks**: earn every Unlock whose threshold its Lifetime Counter has reached, applying its effect.

Mining and Refining evaluate Machines in id order, so a shared limit (Storage room, inputs) is split deterministically.

Production uses the output factor 0.5 + 0.5 × Condition ÷ 100 while Condition is above 0, and 0 when Broken. The Machine Status query reports Broken at 0%, Working when the Machine produced in the last Step, and otherwise Idle with its reason: not on a minable Deposit (including a depleted one), Storage full, or inputs missing.

### Formulas

- **Sale**: selling `a` units at Market Price `p` with the Resource's market depth `D` earns p × D × (1 − e^(−a/D)) Credits and leaves the price at p × e^(−a/D). Splitting a Sale into parts earns the same total. The largest amount that keeps the price at or above `P` is D × ln(p/P).
- **Stat Roll**: each Base Stat is drawn uniformly within its Machine Def's range. The roll quality is the mean of the three Base Stats' positions within their ranges (0 to 1).
- **Offer price**: the Machine Def's base price × (0.7 + 0.6 × roll quality), rounded up to whole Credits.
- **Repair cost**: the Machine Def's Repair cost per point × missing Condition points × (1 + Lifetime Wear ÷ 1000), rounded up to whole Credits.
- **Move cost**: the Machine Def's Move cost per Tile × the Manhattan distance between the Tiles, rounded up to whole Credits.

### Content and starting balance

All content and balance numbers live in data defs in the Game core, never inline in systems. These are the starting values; tuning them for the 15-minute loop is expected.

- **Grid**: 32 × 32 Tiles. The Unlocked Area starts as the central 12 × 12 and grows to 18 × 18, 24 × 24 and 32 × 32 through Unlocks. New-game generation places about 120 Ore Deposits, 50 Crystal Deposits and 200 Rocks over the whole Grid, with at least 6 Ore Deposits and 2 Crystal Deposits inside the starting Unlocked Area. Ore Deposits hold 400 to 1,200, Crystal Deposits 200 to 600. A new Deposit spawns on average every 30 s (75% Ore), while the Unlocked Area holds fewer than one Deposit per 12 Tiles.
- **Starting Kit**: one Drill with every Base Stat at the middle of its range, in the Machine Inventory, and 50 Credits.
- **Machine Defs**:

  | Machine Def | Rate | Efficiency | Durability | Wear rate (%/s) | Mod Slots | Base price | Repair per point | Move per Tile | Works on |
  |---|---|---|---|---|---|---|---|---|---|
  | Drill | 0.8–1.2 Ore/s | 0.8–1.2 | 0.8–1.2 | 0.25 | 2 | 60 | 0.3 | 2 | Ore Deposits |
  | Laser Miner | 2.0–3.0 /s | 0.8–1.2 | 0.8–1.2 | 0.8 | 3 | 400 | 1.0 | 5 | Ore or Crystal Deposits |
  | Refinery | 0.3–0.5 batches/s | 0.8–1.2 | 0.8–1.2 | 0.15 | 2 | 150 | 0.5 | 4 | Empty Tiles |

- **Recipes**: Ore to Alloy, 4 Ore make 1 Alloy, available from the start and the default for new Refineries; Ore plus Crystal to Alloy, 2 Ore and 1 Crystal make 2 Alloy, selectable from the start (it Idles without Crystal).
- **Market**: Base Prices Ore 1, Crystal 6, Alloy 8 Credits; market depth Ore 2,000, Crystal 400, Alloy 400. Market Prices start at their Base Prices.
- **Shop**: 4 Offers per Shop Stock, always at least one of each available Machine Def; a timed Shop Refresh every 180 s; a paid Shop Refresh costs 20 Credits. The Drill and the Refinery are available from the start, the Laser Miner after its Unlock.
- **Storage**: Storage Tier 1 caps are Ore 200, Crystal 100, Alloy 100; each higher tier multiplies the cap by 2.5, up to Storage Tier 5. Storage Upgrades to tiers 2, 3, 4 and 5 cost 100, 400, 1,500 and 6,000 Credits, and each tier is purchasable only after its Unlock.
- **Mod Catalogue**: miner Mods (fit the Drill and the Laser Miner), available from the start: Overclocked Motor, Rate × 1.25, 80 Credits; Precision Bit, Efficiency + 0.2, 60 Credits; Reinforced Casing, Durability × 1.3, 70 Credits. Refinery Mods, after their Unlock: Catalyst Bed, Efficiency × 1.2, 150 Credits; Induction Coils, Rate + 0.1, 150 Credits; Heat Shielding, Durability × 1.3, 120 Credits.
- **Unlocks**, with their Lifetime Counter thresholds: Storage Tier 2 at 300 Ore mined; Laser Miner at 600 Credits earned; Sell Orders at 1,500 Credits earned; Refinery Mods at 100 Alloy refined; Unlocked Area 18 × 18 at 3,000 Ore mined; Storage Tier 3 at 5,000 Credits earned; Unlocked Area 24 × 24 at 1,000 Crystal mined; Storage Tier 4 at 25,000 Credits earned; Unlocked Area 32 × 32 at 60,000 Credits earned; Storage Tier 5 at 150,000 Credits earned.

### Persistence and Offline Progress

- One Save record under one fixed idb-keyval key. Save Version starts at 1. The Migration chain is an ordered list, one Migration per version step; the loader takes the list as an input so tests can supply their own.
- Autosave every 10 s while the page is visible, and once on `visibilitychange` to hidden.
- Boot: read the Save. With no Save, start a new game from a seed taken from the clock. With a Save that fails to load, copy the raw value to a backup key, then start a new game. With a loaded Save, run Offline Replay from Last Seen, then start the Sim Loop.
- On return to a visible page, the Sim Loop hands the time since its last Tick to Offline Replay. An Away Summary is shown when the replayed time is at least 60 s.
- The Away Summary holds the time replayed and whether the 8-hour cap cut it, and the differences in Lifetime Counters (per Resource mined, refined, sold; Credits earned), the Machines that became Broken, the Deposits depleted and the Unlocks earned. It is built by comparing the Game State before and after.

### Scene

- An orthographic camera at a fixed isometric angle, no rotation. Pan by dragging with the left mouse button past a small threshold (a click without drag selects or places), or with WASD and the arrow keys; zoom with the wheel between fixed limits; the camera target is clamped to the Grid.
- Tile picking intersects the pointer ray with the ground plane and converts the point to a Tile; Machines are picked through the Tile they stand on. No per-instance raycasting.
- A model registry, keyed by def id, supplies what each def looks like. Instanced kinds (Tiles, Rocks, Ore and Crystal Deposits) get a geometry and a material; Machines get a component. Every entry is procedural for now; a `.glb` model through `useGLTF` replaces an entry without changing game code.
- Tiles, Rocks and Deposits are drawn with InstancedMesh, one per kind; locked Tiles are drawn darker. Machines are individual meshes.
- Lighting: a drei `Environment` built from procedural `Lightformer`s (no HDRI download), one directional key light, dark fog and PBR materials. Postprocessing: Bloom for emissive parts, Vignette, and the Outline effect on the selected Machine. A hovered Machine gets an emissive tint. Device pixel ratio is limited to between 1 and 2.
- Each Machine shows its Machine Status with a small emissive light (Working, Idle, Broken colours). A Working Laser Miner shows a shader-driven animated beam to its Deposit.
- In placing or moving mode, Tiles that accept the Machine are highlighted and a ghost of the Machine follows the hovered Tile; for a Move the cost is shown next to the ghost.

### HUD

- A top bar with Credits and, per Resource, the amount, the Storage Cap and the current Market Price.
- Panels: Machine Inventory (with a Place button per Machine), Shop, Market, Mods (catalogue and Mod Inventory), Storage, Unlocks (earned and next thresholds with progress), Sell Orders (shown once unlocked).
- The Machine inspector for the selected Machine: Machine Def name, Machine Status, Condition bar, Base and Effective Stats, Mod Slots with fitted Mods (remove buttons, fit from inventory), Recipe selector for a Refinery, and Repair and Move buttons with their costs.
- Notices for failed actions and earned Unlocks; the Away Summary as a dismissable dialog.
- Styling comes from Tailwind `@theme` tokens for the sci-fi palette, fonts and glow. Every displayed number goes through the display formatter; every text comes from the string table.
- With no instructions, the first screen points the player at the Drill waiting in the Machine Inventory, and empty panels say what fills them.

## Testing Decisions

- **Seam: the Game core interface.** Vitest tests in a Node environment call New game, Apply a Player Action, Step, Advance, Fixed-step pacing, Offline Replay, the Queries, Effective Stat, Save load and serialise, the display formatter and the cheats. They catch every rule: the Effective Stat formula, Placement and Move rules, mining and Deposit depletion, Storage Caps and Idle reasons, Deposit spawns, Market drift and Price Impact, Sales, Stat Rolls and Offer prices, Shop Refreshes, Refining and Recipes, Wear, breaking and Repair cost, Mods, Unlocks, Storage Upgrades, Sell Orders, Offline Replay and its Away Summary, and Migrations.
- **Manual check: the running app.** No rendering or end-to-end tests exist. Scene, HUD, Sim Loop, Persistence wiring and Dev Tools are verified by running the app (`npm run dev`, and `npm run build` with `npm run preview` for production-only behaviour), against each ticket's acceptance criteria.
- A good test arranges a Game State (from New game, edited inside `produce` when a scenario needs it), acts through the interface, and asserts on the resulting Game State, a Query or a returned failure reason. Tests never reach into a system's internals, never use `Math.random` or real timers, and use a fixed seed or a scripted Rng.
- Determinism is tested directly: the same seed and the same actions give equal Game States.
- Step-length independence is tested: Advancing a scenario with 5 s Steps lands within a small tolerance of Advancing it with 0.1 s Steps, for Mining, Refining, Wear and Sell Orders.
- Prior art: none; the repository has no code yet.

## Design Patterns

| Pattern | Where | Why |
|---|---|---|
| Command | Player Actions in the Game core | The HUD and the Scene are untested, so every player intent must reach the core as a plain value through one entry that tests can call |
| Result type | Player Actions and Save loading in the Game core | Expected failures (too few Credits, wrong Tile, unreadable Save) must reach the HUD as a reason to show, not as a thrown error |
| Pipeline | The Step's systems | One Step runs an ordered series of independent rules over the Game State, and their order matters (production before Wear, Wear before Sell Orders) |
| Dependency Injection | The Rng in the Step, the current time in Offline Replay and Save serialisation, the Migration list in Save loading | Tests must force random outcomes, times and Migrations without global state |
| Factory Method | The model registry in the Scene | What is drawn for a def depends on its def id at runtime, and procedural models must be replaceable by `.glb` models without changing game code |

## Milestones

### M001: Foundation

The project builds, checks and deploys; a new game generates a Zone; the Sim Loop ticks; and the isometric Scene shows the Grid, Deposits and Rocks under the final lighting, with a HUD top bar. Done when the three check commands pass, the core isolation lint rule rejects a forbidden import, New game is deterministic for a seed, and `npm run dev` shows a pannable, zoomable, lit Grid with Credits shown in the top bar.

### M002: Placing and mining

The player places the Starting Kit Drill on an Ore Deposit, it mines Ore into Storage within its Storage Cap, Deposits deplete and new ones spawn, and Machines can be hovered, selected and inspected. Done when core tests cover Placement rules, mining, Effective Stats, Storage Caps, Idle reasons and Deposit spawns, and in the app a placed Drill fills Ore Storage.

### M003: Market

Market Prices drift around their Base Prices and the player sells Resources, with Price Impact and recovery. Done when core tests cover drift, Sales, Price Impact and recovery, and in the app Ore can be sold for Credits.

### M004: Shop and Moves

The Shop offers pre-rolled Machines that refresh on a timer or for a fee; bought Machines go to the Machine Inventory and are placed; placed Machines can be Moved for a cost. Done when core tests cover Stat Rolls, Offer prices, Shop Refreshes, buying and Moves, and in the app a second Drill is bought, placed and Moved.

### M005: Refining

Refineries are placed on Empty Tiles and turn Resources into Alloy by their Recipe, chosen per Refinery. Done when core tests cover both Recipes, Idle reasons and Recipe changes, and in the app Ore becomes Alloy that can be sold.

### M006: Wear and Repair

Working Machines lose Condition, produce less as they wear, break at 0% and are Repaired for a cost that grows with Lifetime Wear. Done when core tests cover Wear, the output factor, breaking, Repair cost and Repair, and in the app a worn Machine is Repaired.

### M007: Mods

Mods are bought from the Mod Catalogue, fitted into Mod Slots, removed to the Mod Inventory and refitted. Done when core tests cover buying, fitting rules, Effective Stats with Mods and removal, and in the app a Mod is fitted to a Drill and changes its Effective Stats.

### M008: Progression

Lifetime Counters earn Unlocks: the Laser Miner (with Crystal mining and its beam), Storage Tiers with Storage Upgrades, larger Unlocked Area and Refinery Mods. Done when core tests cover thresholds and each Unlock's effect, and in the app Crystal is mined and refined with the Ore plus Crystal Recipe.

### M009: Sell Orders

Once unlocked, Sell Orders sell Resources automatically within their minimum price and Reserve. Done when core tests cover Sell Order execution, Reserve and the minimum price, and in the app a Sell Order sells Ore on its own.

### M010: Saving and Offline Progress

The Game State is saved to IndexedDB and restored on reload, old Saves migrate, and Offline Progress up to 8 hours is replayed with an Away Summary, including on return to a hidden tab. Done when core tests cover Save round trips, Migrations, load failures, Offline Replay, the cap and the Away Summary, and in the app progress survives a reload and an absence shows an Away Summary.

### M011: Dev tools and performance

Leva panels and cheats exist in development only, and the game holds 60 fps with about 50 Machines. Done when core tests cover the cheats, a production build contains neither leva nor the cheats, and the frame rate holds with 50 placed Machines.

## Out of Scope

- Conveyors, belts or any logistics; per-Machine buffers.
- More than one Zone; zone unlocks.
- Selling, scrapping or returning a placed Machine to the Machine Inventory.
- A win condition, prestige or resets other than a lost Save.
- Physics (rapier), camera rotation, Web Workers.
- Mobile, touch and gamepad input.
- Translations other than English (the string table is ready for pt-BR).
- `.glb` models; the model registry is ready for them.
- A localStorage mirror of the Save, cloud saves, export or import.
- A tutorial or scripted onboarding.
- Rendering and end-to-end tests.
- A big-number library.

## Further Notes

- The brainstorm's "UpgradeDefs" are the Mod Defs here; the word "upgrade" is used only for Storage Upgrades, and "milestone" only for this spec's milestones (progression uses "Unlock"). See `GLOSSARY.md`.
- Decisions recorded as ADRs: the pure simulation core, Offline Progress by replay, the seeded Rng in the Game State, IndexedDB saves, plain numbers, and global Storage without logistics (`docs/adr/`).
- Wear accrues only while a Machine produces, in proportion to its output; Idle and Broken Machines do not wear. Lifetime Wear is stored alongside Condition because Repair cost depends on it.
- The balance numbers above are a starting point for the 15-minute loop target (place, mine, refine, sell, buy a second Machine, fit a Mod, Repair one) and will need playtesting; leva panels in M011 help tune them.
- GitHub Pages deploys only after the author adds a GitHub remote and enables Pages with the Actions source.
