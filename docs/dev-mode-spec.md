# Spec: Developer Mode Overlay

- **Status:** DRAFT
- **Date:** 2026-06-dd
- **Repo:** bedrock-vue (public / treated as `green`)

> **Scope note.** This spec covers the **generic dev-mode shell** that lives in
> `@bedrock/vue` (the flag gate, overlay panel, and `registerDevTool()` API).
> The wallet-specific tools (paste-exchange-URL, seed-credentials) are
> registered by `bedrock-vue-wallet` and remain in that repo — see the
> Generalization section for the layer split. The wallet examples below are
> retained as the motivating use case and as a worked example of a consumer
> registering domain tools.

## Goal

A developer-only UI overlay for desktop development of the wallet, where
hardware (camera) and live counterparties (relying parties / issuers) are
unavailable. Lets a developer drive wallet flows by hand instead of scanning
QR codes and running real exchanges.

## Trigger

- Gated by a `localStorage` flag `wallet.devMode` (any truthy value enables).
  Flip in DevTools, no rebuild. Off by default; never on for normal users.
- When enabled, pressing **backtick (`` ` ``) three times** in quick succession
  (within ~500 ms) toggles the dev panel open/closed.
- When the flag is absent/falsy, the key listener is never installed — zero
  behavior change in production.

### Keybinding ownership (per review)

A module that unconditionally grabs a global key risks colliding with keys the
host app — or another module — already uses. Even if a triple-backtick is
unlikely to clash today, the wallet should not assume ownership of a global key
on the app's behalf. Mitigations, smallest first:

- **Scope the trigger to dev mode only.** The detector is installed *only* when
  the `localStorage` flag is set, so production users (and the keys they rely
  on) are never touched. This is the minimum bar and is already in the design.
- **Make the trigger configurable, not hardcoded.** `createTripleKeyDetector`
  already takes `{key, window, onTrigger}`; the bound key is a parameter, so an
  app can override the default (or disable the key trigger and toggle the
  overlay some other way).
- **Defer ownership to the app where one exists.** The cleaner long-term shape
  is for keybinding registration to live at the app level (or a single module
  the app loads and configures), so one place arbitrates keys across all
  modules. When the generic shell is extracted (see Generalization), the
  overlay should *accept* a toggle signal rather than *install* a global
  listener itself — the app/host decides how the overlay is opened (key, menu,
  config). This keeps the wallet from unilaterally capturing a global key.

## Architecture

- Global overlay component mounted in `components/WalletLayout.vue`, as a
  sibling of `<q-page-container>` inside `<q-layout>`, so it is reachable on
  every page.
- New component: `components/DevModeOverlay.vue` (Quasar `q-dialog`/drawer).
- Pure helpers in `lib/devMode.js`:
  - `isDevModeEnabled()` — reads `localStorage['wallet.devMode']`.
  - `createTripleKeyDetector({key, window, onTrigger})` — trigger logic.
  - `parseExchangeInput(text)` — validates a pasted URL is a supported protocol
    (`https:` + `iuv=1`, `openid-credential-offer:`, `openid4vp:`) before
    handing off. Mirrors the checks in `ScannerExchangePage.handleQrCode`.
- TDD: skipped per decision (dev-only tooling). Light tests may be added after
  for `parseExchangeInput` / detector if cheap.

## Tools (finalized after review)

### 1. Paste exchange URL — primary deliverable

- Text area + "Open exchange" button.
- On submit, navigate to `/scanner` and feed the text into the existing scan
  pipeline as `handleScan({type: 'QR_CODE', text})`
  (`routes/ScannerExchangePage.vue:164`). No new exchange logic — reuses
  `handleQrCode` end to end.
- Handoff mechanism: **route query param** (decided). Overlay does
  `router.push({path: '/scanner', query: {devUrl: <text>}})`;
  `ScannerExchangePage` reads `route.query.devUrl` on mount (only when dev mode
  on), skips `BarcodeScanner`, and calls
  `handleScan({type: 'QR_CODE', text: devUrl})`. Chosen over a shared ref
  because it is reload-safe and visible/editable in the address bar during dev.

### 2. Quick login bypass — DROPPED (per review)

- Not doable as a UI-layer change: session is server-backed via
  `@bedrock/web-session`; `requireLogin` checks `session.data.account !== null`
  (`lib/router.js:222`). Faking it in memory fails on the next real API call.
- Out of scope. Revisit only if a backend dev session endpoint becomes
  available.

### 3. Seed test credentials — KEPT (independent value, post-login)

- `getCredentialStore({profileId, password: profileId})` then
  `.add({credentials})` (pattern at `ScannerExchangePage.vue:372`).
- `profileId` comes from `profileManager.getProfiles()` (`HomePage.vue:42`),
  which requires a real logged-in account — so seeding works **after** a normal
  login; it cannot bootstrap an empty/unauthenticated wallet.
- **Why it's useful today:** the only current way to get a credential into the
  wallet is to run a full exchange (issuer → QR/URL → click through store).
  Seeding lets a dev, once logged in, one-click populate the dashboard so they
  can iterate on credential *display* and *management* UIs (dashboard cards,
  details view, delete, share-selection) without re-running an exchange each
  reload. It does not test issuance itself — that's tool #1.
- Fixtures: synthetic, no-PII VCs. Starter set:
  1. **OpenBadgeCredential** — the JFF x VC-EDU PlugFest 3 example taken from
     `vc-playground-docs/_includes/example-issued-credential.html` (image +
     achievement layout).
  2. **UniversityDegreeCredential** — canonical W3C example, text-heavy card.
  3. A **photo-bearing ID-style** VC — exercises subject image rendering.
  Committed as JSON in `lib/devModeFixtures.js`. Source: sibling
  `../vc-playground-docs` and standard W3C examples (all public, synthetic).

## Privacy / Security notes

- No customer/personal data. Fixture VCs are synthetic.
- Dev mode is off by default and the key listener is not installed unless the
  `localStorage` flag is set. No new network surface — only reuses existing
  exchange / credential-store APIs the user already has access to.
- Nothing here weakens server-side auth (that's why login-bypass is dropped,
  which is the correct security posture).

## Files touched

- NEW `components/DevModeOverlay.vue`
- NEW `lib/devMode.js`
- NEW `lib/devModeFixtures.js`
- EDIT `components/WalletLayout.vue` (mount overlay)
- EDIT `routes/ScannerExchangePage.vue` (consume pasted-URL handoff)
- NEW/EDIT `README.md` — document dev mode (how to enable the `localStorage`
  flag, the triple-backtick trigger, and the available tools). Per review (c5)
  and repo PR convention, README is updated in this branch.

## Generalization (decided: fold into `bedrock-vue`)

The `bedrock-vue-*` ecosystem is large (~24 public component libraries plus the
apps that consume them), and the dev-mode mechanism is not wallet-specific. The
design splits cleanly into two layers:

- **Generic shell (reusable):** the `localStorage` flag gate
  (`isDevModeEnabled()`), the configurable trigger
  (`createTripleKeyDetector()` — bound key is a parameter), and the
  `DevModeOverlay` panel with a **tool-registration API**
  (e.g. `registerDevTool({id, label, component})`). None of this knows about
  credentials or exchanges. Per review, the extracted overlay should **accept a
  toggle signal** rather than unilaterally install a global key listener, so
  keybinding ownership stays with the host app (or a single app-level module
  that arbitrates keys across modules) — see "Keybinding ownership" under
  Trigger.
- **Domain tools (app/lib-specific):** paste-exchange-URL and seed-credentials
  live in the wallet. Other consumers would register their own tools — e.g. the
  existing `bedrock-vue-barcode-scanner` / `bedrock-vue-optical-scanner` repos
  could register a "paste instead of scan" tool, which is evidence the
  no-camera pain recurs beyond the wallet.

**Decided home: `bedrock-vue`.** The generic shell lands in `@bedrock/vue`
rather than a new standalone package. `@bedrock/vue` already owns root-app
creation for every bedrock web app, so it can mount the overlay via its existing
app-bootstrap `beforeMount` hook and any app gets the panel for free without
editing its layout. No new repo / CI / release to maintain.

### Layer ownership after the move

- **`bedrock-vue` (generic shell):** the `localStorage` flag gate, the overlay
  panel chrome, and the `registerDevTool({id, label, component})` API.
  bedrock-vue mounts the (empty) shell and exposes the registration API; it
  does **not** know about credentials or exchanges.
- **Trigger (app-owned):** the overlay **accepts a toggle signal** to open/close;
  it does **not** install a global key listener of its own. Keybinding ownership
  stays with the host app (or a single app-level module that arbitrates keys
  across modules), per davidlehn's review. `createTripleKeyDetector({key, ...})`
  remains available as an opt-in helper an app can wire up, but bedrock-vue does
  not claim a global key on every consumer's behalf.
- **`bedrock-vue-wallet` (domain tools):** the wallet keeps owning its
  debugging surface. On init it calls `registerDevTool(...)` for
  paste-exchange-URL and seed-credentials. These reference wallet internals
  (`ScannerExchangePage`, `getCredentialStore`, profile IDs, the VC fixtures)
  and stay in this repo.

### What the wallet shares for debugging is unchanged by the move

Moving the trigger and shell into `bedrock-vue` does **not** move the data
boundary. The wallet's debugging surface is defined entirely by *which tools it
registers*, not by where the panel-open mechanism lives. The trigger only emits
"open the panel now"; the wallet-registered tool components decide what data
they read or write. So bedrock-vue gains "a dev panel exists and here is how it
opens," while the wallet retains full control over what debugging info/tools are
exposed and what data they touch.

### Migration plan

1. **Land the generic shell in `@bedrock/vue`:** flag gate + overlay panel +
   `registerDevTool()` API + a `toggle()`/open signal the panel listens for.
   Mount it from the existing `beforeMount` app-bootstrap hook.
2. **Production-bundle handling — owned by `bedrock-vue`.** `@bedrock/vue` is
   core runtime shipped to every end user, so the dev-only shell must not bloat
   production builds. The exact mechanism (frontend-config gate +
   dead-code-elimination / tree-shaking, or a separate dev entry) is a
   `bedrock-vue` implementation decision; this spec records the requirement and
   defers the detail to that repo.
3. **Wallet registers its domain tools:** `bedrock-vue-wallet` depends on the
   bedrock-vue API and calls `registerDevTool(...)` for paste-exchange-URL and
   seed-credentials. The wallet-local `lib/devMode.js` /
   `components/DevModeOverlay.vue` shell code is removed once bedrock-vue
   provides it; the wallet keeps only the tool components + fixtures.
4. **App wires the trigger:** the consuming app (or an app-level module) decides
   how the overlay opens and signals it, instead of the wallet/bedrock-vue
   grabbing a global key.

**Build-here note:** this branch still builds the shell wallet-locally
(`lib/devMode.js` + `components/DevModeOverlay.vue`) so dev mode is usable now,
keeping the generic/domain seam clean (no wallet concepts in the
flag/trigger/overlay-shell code) so the lift into `bedrock-vue` is mechanical.

## Resolved review questions

1. Login-bypass — **dropped** (c1).
2. Seeding — **kept**; rationale documented above (c2).
3. Fixtures — modeled on VC Playground catalog (c3); 2–3 starter VCs.
4. Pasted-URL handoff — **route query param**, reload-safe and debuggable (c4).
5. README — **added/updated in this branch** (c5).
6. Keybinding ownership — **addressed.** Trigger is dev-mode-only and the bound
   key is configurable; long term the overlay accepts a toggle signal so the app
   (or one app-level module) owns keybindings instead of the wallet capturing a
   global key. See "Keybinding ownership" under Trigger.
7. Eventual home for the generic shell — **decided: fold into `bedrock-vue`**
   (per review). Overlay mounts via `@bedrock/vue`'s `beforeMount` hook;
   wallet registers its domain tools via `registerDevTool()`; the trigger is
   app-owned. Production-bundle handling is owned by `bedrock-vue`. The wallet's
   debugging surface is unchanged by the move. See Generalization above.
