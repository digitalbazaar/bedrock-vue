# bedrock-vue ChangeLog

### Changed
- Added `webpackChunkName` to dynamic imports.
- **BREAKING**: `NotFound` component uses `$config.supportEmail`.
- **BREAKING**: Component `$config` defaults to empty object instead of
  `window.data`. Applications need to setup `supportEmail` from a frontend
  config.

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
