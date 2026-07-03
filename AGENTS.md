# AGENTS.md

## Cursor Cloud specific instructions

Personal portfolio website built with Next.js 16 (App Router, Turbopack) + React 19, package manager is **Bun** (`bun@1.3.14`). Standard commands live in `package.json` and `README.md`.

- **Run bun via `$HOME/.bun/bin/bun`** if `bun` is not on `PATH` (the installer adds it to `~/.bashrc`, but non-login shells may not source it).
- **Dev server:** `bun dev` (binds `0.0.0.0:3000`; use `bun dev:local` for localhost-only). This is the primary way to run the app.
- **Build:** `bun run build`. It runs a full TypeScript check; `@types/geojson` is required for `mapbox-gl`'s types to resolve during that step.
- **Lint:** `bun run lint` runs ESLint directly (`eslint .`) using the flat config in `eslint.config.mjs` (Next.js 16 removed the old `next lint` command). It passes with `0 errors`; the remaining warnings are idiomatic patterns flagged by `eslint-plugin-react-hooks@6`'s new React Compiler rules (`set-state-in-effect`, `refs`), which are intentionally downgraded to `warn` in `eslint.config.mjs`. Use `bunx tsc --noEmit` for standalone type checking.
- **Browserslist** config lives only in `package.json` (`browserslist` key). Do not re-add a `.browserslistrc` file — having both makes Browserslist (and ESLint) throw "contains both .browserslistrc and package.json".
- **Env vars are optional for local dev.** Copy `.env.example` to `.env.local`; all keys can stay empty. The app degrades gracefully:
  - The Kavi trip page (`/kavi-nyc-trip`) falls back to hard-coded static trip events when `KAVI_TRIP_CALENDAR_ICAL_URL` is unset.
  - The trip map renders as a blank/gray placeholder without `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` — this is expected, not an error.
  - The "Ask AI" chat (`/api/kavi-trip/chat`) only works with `AI_GATEWAY_API_KEY`; Braintrust tracing is disabled without `BRAINTRUST_API_KEY`.
- **Key routes:** `/` (portfolio home) and `/kavi-nyc-trip` (map + schedule + AI chat).
