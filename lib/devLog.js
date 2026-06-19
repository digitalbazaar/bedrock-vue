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

import {isDevModeEnabled} from './devMode.js';
import {reactive} from 'vue';

// newest-first reactive buffer of log entries; capped to bound memory
const MAX_ENTRIES = 50;
const _entries = reactive([]);

let _seq = 0;

// classify a value so the log tool can decide how to display it. The renderer
// only distinguishes `object` (collapsible JSON), `error` (message + stack),
// `null`/`undefined` (dimmed literal), and everything else (`text`); strings,
// numbers, booleans, etc. all collapse to `text`.
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
  // plain objects and arrays render as collapsible JSON
  if(typeof value === 'object') {
    return 'object';
  }
  // strings, numbers, booleans, functions, symbols, bigint render as text
  return 'text';
}

function _add(level, value, {label} = {}) {
  // no-op when dev mode is off; don't build entries nothing can display
  if(!isDevModeEnabled()) {
    return undefined;
  }
  const entry = {
    id: ++_seq,
    level,
    kind: _classify(value),
    label,
    value,
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
 * Logs a value to the developer-mode overlay at "info" level. The overlay's
 * built-in log tool renders the value based on its type: text for strings and
 * primitives, collapsible JSON for objects and arrays, message and stack for
 * Errors, and a dimmed literal for `null`/`undefined`. Detected URLs in text
 * values are rendered as clickable links. This is callable from anywhere, like
 * `console.log`, and requires no tool registration.
 *
 * @param {*} value - The value to log.
 * @param {object} [options] - The options to use.
 * @param {string} [options.label] - An optional label shown before the value.
 *
 * @returns {object} The created log entry.
 */
export function devLog(value, options) {
  return _add('info', value, options);
}

devLog.info = (value, options) => _add('info', value, options);
devLog.warn = (value, options) => _add('warn', value, options);
devLog.error = (value, options) => _add('error', value, options);

/**
 * Gets the reactive array of log entries, newest first. Intended for the
 * built-in log tool component.
 *
 * @returns {Array} The reactive entries.
 */
export function getDevLogEntries() {
  return _entries;
}

/**
 * Clears all logged entries.
 */
export function clearDevLog() {
  _entries.length = 0;
}
