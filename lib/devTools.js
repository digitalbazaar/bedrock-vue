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

import {markRaw, reactive, ref} from 'vue';

// reactive registry of dev tools, keyed by `id`; the overlay renders these
const _tools = reactive(new Map());

// reactive open/closed state; the overlay watches this and the host app flips
// it via the toggle/open/close signal
const _open = ref(false);

/**
 * Registers a dev tool to be shown in the developer-mode overlay. This is the
 * registration API consumers (apps/libs) use to contribute their own domain
 * tools; `@bedrock/vue` itself registers nothing. Registering an `id` that
 * already exists replaces the prior registration.
 *
 * @param {object} options - The options to use.
 * @param {string} options.id - A unique identifier for the tool.
 * @param {string} options.label - A human-readable label shown in the panel.
 * @param {object} options.component - The Vue component to render for the tool.
 */
export function registerDevTool({id, label, component} = {}) {
  if(typeof id !== 'string' || id.length === 0) {
    throw new TypeError('"id" must be a non-empty string.');
  }
  if(typeof label !== 'string' || label.length === 0) {
    throw new TypeError('"label" must be a non-empty string.');
  }
  if(component === undefined || component === null) {
    throw new TypeError('"component" must be a Vue component.');
  }
  // mark the component raw so the reactive registry doesn't deep-wrap the
  // component definition itself (Vue warns about reactive components and it
  // adds needless overhead); the registry still tracks add/remove reactively
  _tools.set(id, {id, label, component: markRaw(component)});
}

/**
 * Unregisters a previously registered dev tool.
 *
 * @param {string} id - The id of the tool to remove.
 *
 * @returns {boolean} `true` if a tool was removed, `false` if none matched.
 */
export function unregisterDevTool(id) {
  return _tools.delete(id);
}

/**
 * Gets the registered dev tools as an array, in registration order.
 *
 * @returns {Array} The registered tools (`{id, label, component}`).
 */
export function getDevTools() {
  return [..._tools.values()];
}

/**
 * Gets the reactive open-state ref the overlay watches. Intended for the
 * overlay component; host apps should use the toggle/open/close functions.
 *
 * @returns {object} The reactive open-state ref.
 */
export function getOverlayState() {
  return _open;
}

/**
 * Opens the developer-mode overlay.
 */
export function openDevOverlay() {
  _open.value = true;
}

/**
 * Closes the developer-mode overlay.
 */
export function closeDevOverlay() {
  _open.value = false;
}

/**
 * Toggles the developer-mode overlay open or closed. This is the "toggle
 * signal" the shell accepts; a host app wires its trigger of choice (key, menu
 * item, etc.) to call this.
 */
export function toggleDevOverlay() {
  _open.value = !_open.value;
}
