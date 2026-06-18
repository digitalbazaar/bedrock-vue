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

<!--
  Built-in dev tool that renders devLog() entries by type: text lines for
  strings/primitives, collapsible JSON for objects/arrays, message + stack for
  Errors, and a dimmed literal for null/undefined. Detected URLs in text are
  rendered as clickable links with a copy button. Auto-registered by the shell
  when dev mode is enabled.
-->

<template>
  <div class="dev-log">
    <div class="dev-log__bar">
      <span class="dev-log__count">
        {{entries.length}} entr{{entries.length === 1 ? 'y' : 'ies'}}
      </span>
      <button
        type="button"
        @click="clear">
        Clear
      </button>
    </div>

    <p
      v-if="entries.length === 0"
      class="dev-log__empty">
      Nothing logged yet. Call <code>devLog(value)</code> from app code.
    </p>

    <ul class="dev-log__list">
      <li
        v-for="entry in entries"
        :key="entry.id"
        class="dev-log__entry"
        :class="`dev-log__entry--${entry.level}`">
        <div class="dev-log__meta">
          <span class="dev-log__icon">{{icon(entry.level)}}</span>
          <span class="dev-log__time">{{entry.time}}</span>
          <span
            v-if="entry.label"
            class="dev-log__label">
            {{entry.label}}
          </span>
        </div>

        <!-- objects / arrays: collapsible pretty JSON + copy -->
        <div
          v-if="entry.kind === 'object'"
          class="dev-log__json">
          <button
            type="button"
            class="dev-log__toggle"
            @click="toggle(entry.id)">
            {{expanded.has(entry.id) ? '▾' : '▸'}} {{summary(entry.value)}}
          </button>
          <template v-if="expanded.has(entry.id)">
            <pre class="dev-log__pre"><code>{{pretty(entry.value)}}</code></pre>
            <button
              type="button"
              class="dev-log__copy"
              @click="copy(entry)">
              {{copiedId === entry.id ? 'Copied!' : 'Copy'}}
            </button>
          </template>
        </div>

        <!-- Error: message + stack -->
        <div
          v-else-if="entry.kind === 'error'"
          class="dev-log__error">
          <div class="dev-log__error-msg">
            {{entry.value.name}}: {{entry.value.message}}
          </div>
          <pre
            v-if="entry.value.stack"
            class="dev-log__pre"><code>{{entry.value.stack}}</code></pre>
        </div>

        <!-- null / undefined: dimmed literal -->
        <span
          v-else-if="entry.kind === 'null' || entry.kind === 'undefined'"
          class="dev-log__nullish">
          {{entry.kind}}
        </span>

        <!-- strings, numbers, booleans, other: plain text w/ linkified URLs -->
        <span
          v-else
          class="dev-log__text">
          <template
            v-for="(seg, i) in segments(entry)"
            :key="i">
            <span
              v-if="seg.url"
              class="dev-log__urlwrap">
              <a
                :href="seg.text"
                target="_blank"
                rel="noopener noreferrer"
                class="dev-log__link">{{seg.text}}</a>
              <button
                type="button"
                class="dev-log__urlcopy"
                :title="`Copy ${seg.text}`"
                :aria-label="`Copy URL ${seg.text}`"
                @click="copyUrl(entry.id, i, seg.text)">
                {{copiedUrl === `${entry.id}:${i}` ? '✓ Copied' : 'Copy'}}
              </button>
            </span>
            <template v-else>{{seg.text}}</template>
          </template>
        </span>
      </li>
    </ul>
  </div>
</template>

<script>
import {clearDevLog, getDevLogEntries} from '../lib/devLog.js';
import {ref} from 'vue';

export default {
  name: 'DevLogTool',
  setup() {
    const entries = getDevLogEntries();
    const expanded = ref(new Set());
    const copiedId = ref(null);
    const copiedUrl = ref(null);

    const icon = level => {
      if(level === 'error') {
        return '⛔';
      }
      if(level === 'warn') {
        return '⚠';
      }
      return 'ℹ';
    };

    const pretty = value => JSON.stringify(value, null, 2);

    const summary = value => {
      if(Array.isArray(value)) {
        return `Array(${value.length})`;
      }
      const keys = Object.keys(value);
      return `{${keys.slice(0, 3).join(', ')}${keys.length > 3 ? ', …' : ''}}`;
    };

    const display = entry => String(entry.value);

    // split a string into plain-text and URL segments so URLs can render as
    // clickable links without injecting raw HTML; matches http(s) URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const segments = entry => {
      const text = display(entry);
      const out = [];
      let last = 0;
      let match;
      urlRegex.lastIndex = 0;
      while((match = urlRegex.exec(text)) !== null) {
        if(match.index > last) {
          out.push({text: text.slice(last, match.index), url: false});
        }
        // trim trailing punctuation that is unlikely to be part of the URL
        let url = match[0];
        const trailing = /[.,;:)\]}>]+$/.exec(url);
        if(trailing) {
          url = url.slice(0, url.length - trailing[0].length);
        }
        out.push({text: url, url: true});
        last = match.index + url.length;
      }
      if(last < text.length) {
        out.push({text: text.slice(last), url: false});
      }
      return out;
    };

    const toggle = id => {
      const next = new Set(expanded.value);
      if(next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      expanded.value = next;
    };

    const copy = async entry => {
      try {
        await navigator.clipboard.writeText(pretty(entry.value));
        copiedId.value = entry.id;
        setTimeout(() => {
          copiedId.value = null;
        }, 1500);
      } catch {
        // clipboard unavailable; ignore
      }
    };

    const copyUrl = async (entryId, segIndex, url) => {
      try {
        await navigator.clipboard.writeText(url);
        copiedUrl.value = `${entryId}:${segIndex}`;
        setTimeout(() => {
          copiedUrl.value = null;
        }, 1500);
      } catch {
        // clipboard unavailable; ignore
      }
    };

    return {
      entries, expanded, copiedId, copiedUrl,
      icon, pretty, summary, display, segments, toggle, copy, copyUrl,
      clear: clearDevLog
    };
  }
};
</script>

<style scoped>
.dev-log__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.dev-log__count {
  color: #aaa;
  font-size: 12px;
}
.dev-log__empty {
  color: #aaa;
}
.dev-log__list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.dev-log__entry {
  border-top: 1px solid #2c2c2c;
  padding: 6px 0;
}
.dev-log__meta {
  display: flex;
  gap: 6px;
  align-items: baseline;
  font-size: 11px;
  color: #888;
}
.dev-log__label {
  color: #9ad;
  font-weight: 600;
}
.dev-log__entry--warn .dev-log__icon {
  color: #e0b34a;
}
.dev-log__entry--error .dev-log__icon {
  color: #e06a6a;
}
.dev-log__text {
  white-space: pre-wrap;
  word-break: break-word;
}
.dev-log__nullish {
  color: #777;
  font-style: italic;
}
.dev-log__link {
  color: #6cb6ff;
  text-decoration: underline;
}
.dev-log__urlwrap {
  white-space: nowrap;
}
.dev-log__urlcopy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  min-width: 56px;
  margin-left: 6px;
  padding: 4px 10px;
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  color: #ccc;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  vertical-align: middle;
}
.dev-log__urlcopy:hover {
  background: #3a3a3a;
  color: #fff;
}

/* larger touch target on phones */
@media (max-width: 600px) {
  .dev-log__urlcopy {
    min-height: 40px;
    min-width: 72px;
    font-size: 14px;
  }
}
.dev-log__error-msg {
  color: #e06a6a;
}
.dev-log__toggle {
  background: none;
  border: none;
  color: #9fe3a0;
  cursor: pointer;
  padding: 0;
  font: inherit;
  text-align: left;
}
.dev-log__pre {
  background: #111;
  color: #9fe3a0;
  border-radius: 6px;
  padding: 8px;
  margin: 4px 0;
  max-height: 240px;
  overflow: auto;
  font-size: 12px;
  white-space: pre;
}
.dev-log__copy,
.dev-log__bar button {
  min-height: 28px;
  padding: 4px 10px;
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  color: #ccc;
  cursor: pointer;
  font-size: 12px;
}
.dev-log__copy:hover,
.dev-log__bar button:hover {
  background: #3a3a3a;
  color: #fff;
}
</style>
