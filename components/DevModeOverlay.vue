<!--
Copyright 2026 Digital Bazaar, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <div
    v-if="open"
    class="dev-mode-overlay"
    role="dialog"
    aria-label="Developer Mode">
    <header class="dev-mode-overlay__header">
      <span class="dev-mode-overlay__title">Developer Mode</span>
      <button
        type="button"
        class="dev-mode-overlay__close"
        aria-label="Close developer mode"
        @click="close">
        &times;
      </button>
    </header>
    <div class="dev-mode-overlay__body">
      <p
        v-if="tools.length === 0"
        class="dev-mode-overlay__empty">
        No dev tools registered. Use <code>registerDevTool()</code> to add one.
      </p>
      <section
        v-for="tool in tools"
        :key="tool.id"
        class="dev-mode-overlay__tool">
        <h3 class="dev-mode-overlay__tool-label">
          {{tool.label}}
        </h3>
        <component :is="tool.component" />
      </section>
    </div>
  </div>
</template>

<script>
import {
  closeDevOverlay, getDevTools, getOverlayState
} from '../lib/devTools.js';
import {computed} from 'vue';

export default {
  name: 'DevModeOverlay',
  setup() {
    const open = getOverlayState();
    const tools = computed(() => getDevTools());
    return {open, tools, close: closeDevOverlay};
  }
};
</script>

<style scoped>
.dev-mode-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 360px;
  max-width: 100vw;
  z-index: 2147483647;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  color: #f0f0f0;
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.4);
  font-family: system-ui, sans-serif;
  font-size: 14px;
}
.dev-mode-overlay__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid #3a3a3a;
}
.dev-mode-overlay__title {
  font-weight: 600;
}
.dev-mode-overlay__close {
  background: none;
  border: none;
  color: inherit;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  padding: 0 4px;
}
.dev-mode-overlay__body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}
.dev-mode-overlay__empty {
  color: #aaa;
}
.dev-mode-overlay__tool {
  margin-bottom: 16px;
}
.dev-mode-overlay__tool-label {
  margin: 0 0 8px;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ad;
}
</style>
