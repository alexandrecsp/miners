# Pure simulation core over one serialisable Game State

All game rules live in a pure TypeScript core that imports nothing from React, three or zustand (enforced by ESLint `no-restricted-imports`), and operate on one serialisable Game State held in zustand: the sim is a pure `step(state, dt, rng)` run with immer on the main thread at a fixed 10 Hz, and the R3F scene only reads the store through `getState()` in `useFrame`. We chose this so the whole economy is unit-testable without rendering, saves are a plain dump of one object, and Offline Replay can reuse the live Step; the cost is that every rule must be expressible as a mutation of plain data.

## Considered options

- Running the sim in a Web Worker: rejected for the slice; at ~50 Machines the Step is cheap, and a worker would force message passing between the store and the scene.
- Game logic inside React components or R3F hooks: rejected; it cannot be tested without rendering and cannot be replayed offline.
