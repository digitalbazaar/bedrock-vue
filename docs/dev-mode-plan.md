# Plan: Dev-Mode Generic Shell in @bedrock/vue
- **Branch:** feature/dev-mode-overlay
  
- **Repo:** bedrock-vue (PUBLIC → green)
  
- **Spec:** docs/dev-mode-spec.md
  
- **Scope:** generic shell ONLY + one trivial reference tool. No wallet tools/fixtures.
  
## Decisions (confirmed)
- Overlay = plain Vue + scoped CSS. NO Quasar (this pkg has no Quasar dep; core runtime must stay dep-light). Consumer tool components may use their own UI libs.
  
- Auto-mount empty shell inside bootstrap, gated by `isDevModeEnabled()`. App gets panel free, no layout edits.
  
- Trigger = app-owned. Shell accepts toggle signal; does NOT install global key listener. `createTripleKeyDetector` shipped as opt-in helper.
  
## Reality vs spec (this repo)
- No Quasar, no `test/`, no test runner (only `lint`). TDD skipped per spec; add light tests only if a runner gets wired (out of scope now).
  
- `beforeMount` hook is app-supplied, not auto-run → mount via `install()`/`bootstrap()` instead.
  
- License header = full Apache-2.0 block w/ year range (match existing files), not short DB header. Use `2026` per current year.
  
## Files
### NEW `lib/devMode.js` (pure helpers, functional core)
- `isDevModeEnabled()` — truthy read of `localStorage['bedrock.devMode']`. Wrapped in try/catch (localStorage can throw).
  
- `createTripleKeyDetector({key = '`', windowRef = window, onTrigger, timeoutMs = 500})`— returns`{install(), uninstall()}`. Counts 3 presses of` key`within`timeoutMs`. Pure-ish: window injectable for test.
  
- No DOM/Vue imports here → unit-testable later w/o a runner.
  
### NEW `lib/devTools.js` (registration API + toggle signal)
- Module-level reactive registry: `registerDevTool({id, label, component})`, `getDevTools()`, `unregisterDevTool(id)`. Dedupe by `id`.
  
- `toggleDevOverlay()` / `openDevOverlay()` / `closeDevOverlay()` — flip a reactive `ref` the overlay watches. This is the "toggle signal" the shell accepts.
  
- Knows nothing about credentials/exchanges.
  
### NEW `components/DevModeOverlay.vue` (shell chrome, plain Vue)
- Slide-in panel (scoped CSS, fixed position, high z-index). v-if on reactive open ref from devTools.js.
  
- Renders registered tools: header (label) + `<component :is="tool.component"/>` per registered tool. Empty-state text when none.
  
- Close button → `closeDevOverlay()`. No Quasar.
  
### EDIT `lib/index.js`
- In `install(app)` (or bootstrap): if `isDevModeEnabled()`, lazy-register the overlay globally and mount it as a sibling of root render, lazy-loaded via dynamic import w/ `webpackChunkName: "bedrock-vue-devmode"` so it's a separate chunk.
  
  - Mount approach: add overlay to root render tree (wrap `h(_state.rootVue)` so overlay is a sibling), guarded so production (flag off) renders nothing and never imports the chunk.
    
- Export new public API: `isDevModeEnabled`, `registerDevTool`, `unregisterDevTool`, `toggleDevOverlay`, `openDevOverlay`, `closeDevOverlay`, `createTripleKeyDetector`.
  
### NEW `components/DevToolExample.vue` (reference tool)
- Trivial demo (e.g. button that `console.log`s + shows a counter). Documents the `registerDevTool` contract for consumers. Registered only in dev mode, only as example — gated so it doesn't ship behavior to real apps. (See Q2: register by default vs docs-only.)
  
### EDIT `README.md`
- New "Developer Mode" section: enable via `localStorage.setItem('bedrock.devMode','1')`, how the shell mounts, `registerDevTool()` contract, wiring a trigger (incl. `createTripleKeyDetector` example), and that tools/data live in the consumer.
  
### Production-bundle handling
- Runtime gate (`isDevModeEnabled()`) + lazy chunk = overlay code never executes for normal users. Chunk still _ships_ unless build strips it.
  
- Document optional build-time DCE (define-plugin / `process.env` guard) for apps that want zero bytes. Full DCE wiring deferred (spec allows). Record requirement in README.
  
## Steps
1. `lib/devMode.js` (helpers).
  
2. `lib/devTools.js` (registry + toggle signal).
  
3. `components/DevModeOverlay.vue` (shell).
  
4. `components/DevToolExample.vue` (reference tool).
  
5. Wire mount + exports in `lib/index.js`.
  
6. README section.
  
7. `npm run lint` (eslint w/ DB config — fix sort-imports etc.). Manual smoke if a consuming app available.
  
## Out of scope (stays in bedrock-vue-wallet)
paste-exchange-URL, seed-credentials, VC fixtures, ScannerExchangePage edits, WalletLayout edits.
## Resolved decisions (from review)
1. **Flag key name → `bedrock.devMode`** (generic, not wallet-specific). Wallet migration updates its docs to the new key.
2. **Reference tool → docs-only sample.** `DevToolExample.vue` ships unregistered; README shows how to register it. Not auto-registered (avoids a stray demo tool in every consumer panel).
3. **Tests → deferred.** Repo has NO runner (mocha not installed), NO `test/` scaffold, and CI (`main.yml`) is lint-only. Adding tests = net-new scaffolding (deps + `test/` sub-package + CI test matrix) for ~4 assertions on one helper — disproportionate for dev-only tooling. Keep `lib/devMode.js` pure so a `test/mocha/01-devMode.js` can be added cheaply if a runner lands later.
