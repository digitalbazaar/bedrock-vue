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

// localStorage flag that gates all dev-mode behavior; any truthy value enables
const DEV_MODE_FLAG = 'bedrock.devMode';

/**
 * Returns whether developer mode is enabled. Developer mode is gated by a
 * `localStorage` flag named `bedrock.devMode` and any truthy stored value
 * enables it. Reading `localStorage` can throw when storage is unavailable, so
 * any failure is treated as not enabled.
 *
 * @returns {boolean} `true` if dev mode is enabled, `false` otherwise.
 */
export function isDevModeEnabled() {
  try {
    return Boolean(globalThis.localStorage?.getItem(DEV_MODE_FLAG));
  } catch {
    // storage unavailable; treat as disabled
    return false;
  }
}

/**
 * Creates a detector that invokes `onTrigger` when a key is pressed three
 * times in quick succession (within `timeoutMs`). The detector is not active
 * until `install()` is called and stops when `uninstall()` is called.
 *
 * This is shipped as an opt-in helper. `@bedrock/vue` does not install a global
 * key listener on a consumer app's behalf; the host app decides whether and how
 * to wire a trigger to `toggleDevOverlay()`.
 *
 * @param {object} options - The options to use.
 * @param {string} [options.key='`'] - The `KeyboardEvent.key` to detect.
 * @param {object} [options.windowRef=globalThis] - The event target to listen
 *   on (injectable for testing).
 * @param {Function} options.onTrigger - Called when the triple press occurs.
 * @param {number} [options.timeoutMs=500] - Max time between presses, in ms.
 *
 * @returns {object} An object with `install()` and `uninstall()` methods.
 */
export function createTripleKeyDetector({
  key = '`', windowRef = globalThis, onTrigger, timeoutMs = 500
} = {}) {
  if(typeof onTrigger !== 'function') {
    throw new TypeError('"onTrigger" must be a function.');
  }

  let count = 0;
  let last = 0;

  const handler = event => {
    if(event.key !== key) {
      return;
    }
    const now = event.timeStamp ?? 0;
    if(count > 0 && (now - last) > timeoutMs) {
      // too slow; restart the sequence
      count = 0;
    }
    count++;
    last = now;
    if(count >= 3) {
      count = 0;
      onTrigger();
    }
  };

  return {
    install() {
      windowRef.addEventListener('keydown', handler);
    },
    uninstall() {
      windowRef.removeEventListener('keydown', handler);
    }
  };
}

/**
 * Creates a detector that invokes `onTrigger` when a screen corner is tapped
 * (or clicked) a number of times in quick succession. This is the touch-device
 * analog of {@link createTripleKeyDetector}, since a key trigger is not usable
 * on mobile. Like that helper, it is opt-in: `@bedrock/vue` does not install it
 * on a consumer app's behalf; the host app decides whether to wire it to
 * `toggleDevOverlay()`.
 *
 * The corner hit-zone is invisible and small, so it does not interfere with
 * normal use; only a deliberate repeated tap in the corner triggers it.
 *
 * @param {object} options - The options to use.
 * @param {string} [options.corner='top-right'] - Which corner to watch:
 *   `top-left`, `top-right`, `bottom-left`, or `bottom-right`.
 * @param {number} [options.taps=5] - Number of taps required.
 * @param {number} [options.timeoutMs=2000] - Max time for the full sequence,
 *   in ms; the count resets if a tap arrives later than this after the first.
 * @param {number} [options.size=48] - Size of the square corner hit-zone, in
 *   CSS pixels.
 * @param {object} [options.windowRef=globalThis] - The event target to listen
 *   on (injectable for testing).
 * @param {Function} options.onTrigger - Called when the tap sequence completes.
 *
 * @returns {object} An object with `install()` and `uninstall()` methods.
 */
export function createTapTrigger({
  corner = 'top-right', taps = 5, timeoutMs = 2000, size = 48,
  windowRef = globalThis, onTrigger
} = {}) {
  if(typeof onTrigger !== 'function') {
    throw new TypeError('"onTrigger" must be a function.');
  }

  let count = 0;
  let start = 0;

  const inCorner = (x, y) => {
    const w = windowRef.innerWidth ?? 0;
    const h = windowRef.innerHeight ?? 0;
    const left = corner === 'top-left' || corner === 'bottom-left';
    const top = corner === 'top-left' || corner === 'top-right';
    const okX = left ? x <= size : x >= (w - size);
    const okY = top ? y <= size : y >= (h - size);
    return okX && okY;
  };

  const handler = event => {
    if(!inCorner(event.clientX, event.clientY)) {
      // tap outside the corner zone resets the sequence
      count = 0;
      return;
    }
    const now = event.timeStamp ?? 0;
    if(count === 0 || (now - start) > timeoutMs) {
      // begin (or restart) a sequence
      count = 1;
      start = now;
    } else {
      count++;
    }
    if(count >= taps) {
      count = 0;
      onTrigger();
    }
  };

  return {
    install() {
      windowRef.addEventListener('pointerdown', handler);
    },
    uninstall() {
      windowRef.removeEventListener('pointerdown', handler);
    }
  };
}
