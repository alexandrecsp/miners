# Coding Standards

Rules the Standards reviewer checks each diff against. Import restrictions on the Game core, formatting and type strictness are enforced by ESLint and TypeScript and are not repeated here.

## Game core

- Every game rule (production, prices, costs, Wear, Unlocks, Placement checks) lives in the Game core; React components, R3F code and stores never compute a game outcome themselves.
- The Game State holds only JSON-serialisable plain data: no class instances, Maps, Sets, Dates, functions or `undefined` values.
- Entity ids come from the Game State's id counter, never from random or time-based sources.
- Every random draw goes through the Rng passed in; no code draws randomness any other way for game outcomes.
- The current real time enters the Game core only as a parameter.
- Time-based quantities in a Step are expressed per second and multiplied by `dt`; no system assumes a particular Step length.
- Each Step system is a separate function over the draft, called in order from the Step; systems do not call each other.
- Player Actions that can fail return a failure with a string-id reason and leave the Game State unchanged; expected failures are never thrown.
- A Player Action's rule check is the same function the Queries expose to the HUD and the Scene, not a copy.
- Content and balance numbers (prices, Stat ranges, thresholds, costs, rates) live in the defs, not inline in systems or components.
- Domain names in code follow `GLOSSARY.md` (Machine, Deposit, Condition, Mod, Unlock, and so on), including "Mod" rather than "upgrade" for Machine Mods.

## Saves

- From M010 on, any change to the Game State's shape bumps the Save Version and adds a Migration with a test that loads a Save of the previous version.

## State and rendering

- The Game State changes only through the Game Store's `dispatch`, the Sim Loop, the boot sequence and the dev cheats; components never write it directly.
- View-only state (selection, hover, interaction mode, open panels) lives in the UI Store, never in the Game State. The Look store (`src/scene/lookStore.ts`) is the exception: it holds dev-tuned rendering settings for the Scene, not player view state.
- Code inside `useFrame` reads stores through `getState()` and never calls a store setter or a React state setter.
- HUD components subscribe to the narrowest selector that serves them; a component never subscribes to the whole Game State.
- Tiles, Rocks and Deposits are drawn with InstancedMesh; never one mesh per item.
- What a def looks like comes from the model registry by def id; scene code never builds a def's geometry inline.

## UI

- Every player-facing text comes from the string table by id; components contain no literal English.
- Every number shown to the player goes through the display formatter.
- Colours, fonts and glow come from the Tailwind `@theme` tokens; components contain no literal colour values.

## Dev tools

- leva and the cheats are reached only through a dynamic import behind the development-mode flag; production code never imports them statically.

## Tests

- Tests live beside the Game core and exercise it through its interface: New game, Player Actions, Step, Advance, Offline Replay, Queries, Save and the formatter.
- The UI Store is a second test seam: its tests sit beside it and exercise it through its actions and `getState()`, resetting its state between tests.
- Tests use a fixed seed or a scripted Rng and never real timers, `Math.random` or the real clock.
