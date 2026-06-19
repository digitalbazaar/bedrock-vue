/*!
 * Copyright 2026 Digital Bazaar, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {reactive} from 'vue';

// newest-first reactive buffer of mirrored console entries; capped to bound
// memory
const MAX_ENTRIES = 50;
const _entries = reactive([]);

let _seq = 0;

// the console methods we mirror, mapped to a display severity; other methods
// (group, table, trace, assert, ...) are left untouched and pass through to the
// real console only
const _methodLevels = {
  log: 'info',
  info: 'info',
  debug: 'info',
  warn: 'warn',
  error: 'error'
};

// saved original console methods, set while the mirror is installed; used both
// to restore on uninstall and to forward calls (so the real console keeps
// working and we never recurse)
let _originals = null;

// classify a single console argument so the log tool can decide how to display
// it. The renderer distinguishes `object` (collapsible JSON), `error` (message
// + stack), `null`/`undefined` (dimmed literal), and everything else (`text`).
function _classify(value) {
  if(value === null) {
    return 'null';
  }
  if(value === undefined) {
    return 'undefined';
  }
  if(value instanceof Error) {
    return 'error';
  }
  if(typeof value === 'object') {
    return 'object';
  }
  return 'text';
}

function _add(level, args) {
  const entry = {
    id: ++_seq,
    level,
    // console methods take varargs; keep each arg with its own kind so the
    // renderer can show text inline and objects/errors richly
    args: args.map(value => ({kind: _classify(value), value})),
    // timestamp formatted at log time
    time: new Date().toLocaleTimeString()
  };
  _entries.unshift(entry);
  if(_entries.length > MAX_ENTRIES) {
    _entries.length = MAX_ENTRIES;
  }
  return entry;
}

/**
 * Mirrors `console` output into the developer-mode overlay. Patches the common
 * console methods (`log`, `info`, `debug`, `warn`, `error`) so each call is
 * *both* forwarded to the real console (unchanged) *and* captured for display
 * in the overlay's built-in log tool. This means existing `console.*` calls
 * anywhere in the stack appear in the overlay with no code changes; there is a
 * single way to log.
 *
 * Other console methods (`group`, `table`, `trace`, `assert`, etc.) are left
 * untouched and continue to behave normally in the real console.
 *
 * Calling this more than once without an intervening
 * {@link uninstallConsoleMirror} is a no-op. Intended to be installed by the
 * shell when dev mode is enabled.
 */
export function installConsoleMirror() {
  if(_originals) {
    // already installed
    return;
  }
  _originals = {};
  for(const method of Object.keys(_methodLevels)) {
    const original = console[method];
    _originals[method] = original;
    const level = _methodLevels[method];
    console[method] = (...args) => {
      // forward to the real console first (using the saved original so we never
      // recurse through our own wrapper)
      original.apply(console, args);
      _add(level, args);
    };
  }
}

/**
 * Restores the original `console` methods patched by
 * {@link installConsoleMirror}. A no-op if the mirror is not installed.
 */
export function uninstallConsoleMirror() {
  if(!_originals) {
    return;
  }
  for(const method of Object.keys(_originals)) {
    console[method] = _originals[method];
  }
  _originals = null;
}

/**
 * Gets the reactive array of mirrored console entries, newest first. Intended
 * for the built-in log tool component.
 *
 * @returns {Array} The reactive entries.
 */
export function getDevLogEntries() {
  return _entries;
}

/**
 * Clears all mirrored entries.
 */
export function clearDevLog() {
  _entries.length = 0;
}
