# AGENTS.md

## What this app is
KEY OF DAVID is a **client-only Vite + React SPA** (React 19, react-router-dom, Tailwind CSS v4,
`motion`, lucide-react). It is a public editorial portfolio with a lazily-loaded `/admin` area.

## Non-obvious things
- **There is no backend in this repo.** `express` / `@types/express` are declared in
  `package.json` and `metadata.json` advertises a "server-side Gemini" capability, but there is
  no `server.js`/`api/` entry point and no `process.env` usage outside Vite. `GEMINI_API_KEY` in
  `.env.example` is therefore unused and **not required to run or render the app**.
- **Data lives in Firebase Firestore (Web SDK), with a localStorage fallback.** Config resolution
  in `src/lib/firebase.ts` goes: `VITE_FIREBASE_*` env → `firebase-applet-config.json` → hardcoded
  defaults. Because `firebase-applet-config.json` is committed, the app boots **with no env vars
  set**. Firestore rules (`firestore.rules`) allow anonymous reads of published content, so the
  public site works without credentials. The `/admin` area requires Google sign-in as the verified
  owner (`src/config/owner.ts`) — expect `Access restricted` unless signed in as that account.
- If Firebase is unreachable/denied at runtime, `handleFirestoreError` (in `src/lib/db.ts`) throws
  from the snapshot error callback; `useSettings` still renders `DEFAULT_SETTINGS`, but `useWorks`
  keeps an empty list, so the portfolio grid can look empty. Check the browser console first.

## Sandbox override (Base44 preview only)
The committed `firebase-applet-config.json` points at a Firebase project whose Firestore rules
deny anonymous reads (`Missing or insufficient permissions`), so the public content collections
(works / services / categories / socialLinks) come back empty. Because "no env vars" was meant to
mean "use the localStorage store", the sandbox preview forces that designed fallback:

- `vite.config.ts` adds `BASE44_` to Vite's `envPrefix` **only** when
  `process.env.BASE44_PREVIEW_MODE === '1'`, exposing the platform flag to client code.
- `src/lib/firebase.ts` treats `BASE44_PREVIEW_MODE === '1'` as "Firebase not configured", so
  `src/lib/db.ts` uses its localStorage store seeded with `DEFAULT_*` demo data.

With the flag unset (or any other value) both files keep their original behavior: Firebase is used
whenever config is present, and Vite's env prefix stays `VITE_`. No application logic is gated on
the flag — only the data source for the sandbox. For real cloud data, deploy `firestore.rules` to
the target project or supply `VITE_FIREBASE_*` credentials (optional `.env.example` values).

## Non-obvious setup note
`npm install` must use `--legacy-peer-deps`: the repo has no lockfile and its root
`esbuild@^0.25.0` devDependency conflicts with `vite@8`'s peerOptional `esbuild` range. Vite ships
its own esbuild, so the root copy is unused.

## Running it
Everything runs through `docker-compose.base44.yml` (single `web` service, Vite dev server on
port 3000). The source is bind-mounted and `npm install` runs on startup into a named volume.

```bash
docker compose -f docker-compose.base44.yml up -d --build
docker compose -f docker-compose.base44.yml ps
curl -sSf http://localhost:3000/ >/dev/null && echo up
```

## Verifying
- `npm run lint` runs `tsc --noEmit` (no separate test suite exists).
- `npm run build` produces a production bundle.
- There is no automated test framework in the repo.
