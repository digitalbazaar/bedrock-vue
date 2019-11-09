# bedrock-vue ChangeLog

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
