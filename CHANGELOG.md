# bedrock-vue ChangeLog

## 5.1.0 - 2024-02-28

### Changed
- Relicense under the Apache-2.0 license.

## 5.0.1 - 2022-08-22

### Fixed
- Ensure components are exported.

## 5.0.0 - 2022-08-19

### Changed
- **BREAKING**: Use `exports` instead of `module`.
- Lint module.

## 4.0.1 - 2022-05-28

### Fixed
- Remove obsolete `next` term from `updateTitle` internal route guard.

## 4.0.0 - 2022-05-26

### Added
- Add `initialize()`, `augmentRouter`, and `getRootApi` APIs. See README for
  migration tips.

### Changed
- **BREAKING**: Upgrade to Vue 3, drop Vue 2 support. See README for migration
  tips.

### Removed
- **BREAKING**: Remove Vue 2 support.
- **BREAKING**: Remove `makeReactive()` API; import `reactive` from `vue`
  instead.
- **BREAKING**: Remove `setRootVue`; use `initialize()` instead.
- **BREAKING**: Remove default `BrApp`, `BrRoot`, `BrHeader`, `BrFooter`
  components; see README for migration tips.
- **BREAKING**: Remove environmental variable setup of debugging / devtools;
  see Vue 3 documentation for how to enable extra debugging tools.

## 3.0.2 - 2022-04-10

### Fixed
- Fix component imports.

## 3.0.1 - 2022-04-10

### Fixed
- Fix bad import.

## 3.0.0 - 2022-04-10

### Changed
- **BREAKING**: Rename package to `@bedrock/vue`.
- **BREAKING**: Convert to module (ESM).

## 2.3.0 - 2022-03-16

### Added
- Add `makeReactive` utility API.

## 2.2.0 - 2022-01-23

### Added
- Include vue config under `vue` property in shared config from
  `bedrock-web`.

### Fixed
- Properly mark dependencies as peer dependencies as the code will not
  function properly if different versions are installed and used in a single
  web app.

## 2.1.2 - 2021-05-05

### Fixed
- Fix linting issues.

## 2.1.1 - 2021-05-05

### Changed
- Update dependencies.
- Use `$router.addRoute` instead of deprecated `$router.addRoutes`.

## 2.1.0 - 2020-03-30

### Added
- Allow defines for Vue.config.{devtools,productionTip,performance}.

## 2.0.1 - 2019-11-12

### Changed
- Update dependencies.

## 2.0.0 - 2019-11-08

### Changed
- Added `webpackChunkName` to dynamic imports.
- **BREAKING**: `NotFound` component uses `$config.contacts.support.email`.
- **BREAKING**: Component `$config` defaults to shared config object instead of
  `window.data`. Applications need to update vars as appropriate. The only
  optional defined key now is `$config.contacts.support.email`.

### Added
- Common config schema:
  - `config.contacts.support.email` for support emails.
- Error page system includes a generic error page, and a base error page. Base
  page component name can be changed with the frontend
  `config.ui.components['br-error-base']` value. Allows for custom styling
  instead of basic HTML.

### Removed
- Overrides unneeded with bedrock-views 7 + bedrock-webpack 3.

## 1.2.0 - 2019-02-19

### Changed
- Upgrade Vue.js to version 2.6.

## 1.1.1 - 2018-07-25

### Added
- Include webpack config alias in package.json.

## 1.1.0 - 2018-07-18

### Added
- Lazy load `BrRoot` and `NotFound` components. These
  are lazy loaded as they may be replaced downstream
  or never hit by the client.

## 1.0.3 - 2018-07-13

### Fixed
- Fix crash when `setRootVue` receives a function that
  resolves to `false` (indicating that bootstrapping the Vue
  application should not occur).

## 1.0.2 - 2018-05-22

### Changed
- Ensure Vue devtools are notified once vue is bootstrapped
  provided that `Vue.config.devtools === true`.

## 1.0.1 - 2018-05-02

### Changed
- Use `bedrock-web` renamed from bedrock-frontend.

## 1.0.0 - 2018-05-01

### Changed
- 1.0.0 release.

## 0.1.0 - 2018-05-01

### Added
- Add core files.

- See git history for changes previous to this release.
