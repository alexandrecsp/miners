---
id: T001
title: Scaffold the project with core isolation and the display formatter
milestone: M001
blocked-by: []
status: done
---

## What to build

A Vite, React and strict TypeScript npm project that a developer can run, check and deploy. The Game core layer is in place, and its first public piece, the display formatter, works end to end: it is unit-tested, and the placeholder app page renders a few formatted numbers styled with the Tailwind `@theme` tokens.

- npm scripts `dev`, `build`, `preview`, `test` (Vitest, single run, Node environment), `typecheck` (no emit) and `lint` (ESLint flat config).
- The Vite base path is relative.
- The ESLint config forbids the Game core from importing react, react-dom, three, @react-three/*, zustand, leva and idb-keyval, and from using `Math.random`, `Date.now`, `performance.now`, `window`, `document` and `localStorage`.
- Tailwind v4 through `@tailwindcss/vite`, with `@theme` tokens for the sci-fi palette, the display and body fonts (bundled from npm font packages) and a glow.
- The English string table in the Game core, keyed by stable string ids, holding the placeholder page's text.
- The display formatter as the spec describes: whole numbers below 1,000; one decimal with K, M, B and T suffixes from 1,000; scientific notation past T; a price mode with two decimals below 100.
- A GitHub Actions workflow that, on push to `main`, installs, runs the three check commands, builds and deploys to GitHub Pages.

## Design patterns

None

## Acceptance criteria

- [ ] `npm test`, `npm run typecheck` and `npm run lint` all pass on the fresh project.
- [ ] A Game core file that imports react, or calls `Math.random`, fails `npm run lint` (checked by hand, then reverted).
- [ ] Formatter tests: 0, 999 and 999.9 format as whole numbers; 1,234 formats as 1.2K; 3,400,000 as 3.4M; values past the T range use scientific notation; negative numbers keep their sign; price mode shows 0.85 and 12.5 with two decimals and 1,234 as 1.2K.
- [ ] `npm run dev` shows the placeholder page in the theme's colours and fonts, with its text taken from the string table.
- [ ] `npm run build` produces a build that is served from a sub-path without broken asset links.
- [ ] The deploy workflow exists and runs the three check commands before building.
