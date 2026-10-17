## SDD

This repo is built with Spec Driven Development.

- Domain terms: `GLOSSARY.md` (or `GLOSSARY-MAP.md` when there are several contexts). Name domain concepts exactly as it does.
- Decisions: `docs/adr/`. Read the ADRs in the area you touch, and say so explicitly when your work contradicts one.
- Coding standards: `CODING_STANDARDS.md`, checked by `code-review`.
- Settings: `.sdd/config.json`. Specs and tickets: `.sdd/specs/`.

Any of these may not exist yet; proceed without them.

### Check commands

Run in this order; all must pass before a commit.

1. `npm test`
2. `npm run typecheck`
3. `npm run lint`
