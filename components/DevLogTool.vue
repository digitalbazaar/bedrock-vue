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
      Nothing logged yet. Mirrored <code>console.*</code> output appears here
      when dev mode is on.
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
        </div>

        <!-- a console call has one or more args; render each by its kind -->
        <div class="dev-log__args">
          <template
            v-for="(arg, ai) in entry.args"
            :key="ai">
            <!-- objects / arrays: collapsible pretty JSON + copy -->
            <div
              v-if="arg.kind === 'object'"
              class="dev-log__json">
              <button
                type="button"
                class="dev-log__toggle"
                @click="toggle(key(entry, ai))">
                {{expanded.has(key(entry, ai)) ? '▾' : '▸'}}
                {{summary(arg.value)}}
              </button>
              <template v-if="expanded.has(key(entry, ai))">
                <pre
                  class="dev-log__pre"><code>{{pretty(arg.value)}}</code></pre>
                <button
                  type="button"
                  class="dev-log__copy"
                  @click="copy(entry, ai, arg.value)">
                  {{copiedId === key(entry, ai) ? 'Copied!' : 'Copy'}}
                </button>
              </template>
            </div>

            <!-- Error: message + stack -->
            <div
              v-else-if="arg.kind === 'error'"
              class="dev-log__error">
              <div class="dev-log__error-msg">
                {{arg.value.name}}: {{arg.value.message}}
              </div>
              <pre
                v-if="arg.value.stack"
                class="dev-log__pre"><code>{{arg.value.stack}}</code></pre>
            </div>

            <!-- null / undefined: dimmed literal -->
            <span
              v-else-if="arg.kind === 'null' || arg.kind === 'undefined'"
              class="dev-log__nullish">
              {{arg.kind}}
            </span>

            <!-- strings, numbers, etc.: plain text w/ linkified URLs -->
            <span
              v-else
              class="dev-log__text">
              <template
                v-for="(seg, si) in segments(arg.value)"
                :key="si">
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
                    @click="copyUrl(`${entry.id}:${ai}:${si}`, seg.text)">
                    {{copiedUrl === `${entry.id}:${ai}:${si}` ?
                      '✓ Copied' : 'Copy'}}
                  </button>
                </span>
                <template v-else>{{seg.text}}</template>
              </template>
            </span>
          </template>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import {clearDevLog, getDevLogEntries} from '../lib/consoleMirror.js';
import {ref} from 'vue';

export default {
  name: 'DevLogTool',
  setup() {
    const entries = getDevLogEntries();
    const expanded = ref(new Set());
    const copiedId = ref(null);
    const copiedUrl = ref(null);

    // stable key for an arg within an entry (entries hold a console call's
    // varargs); used to track per-arg expand/copy state
    const key = (entry, argIndex) => `${entry.id}:${argIndex}`;

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

    // split a string into plain-text and URL segments so URLs can render as
    // clickable links without injecting raw HTML; matches http(s) URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const segments = value => {
      const text = String(value);
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

    const copy = async (entry, argIndex, value) => {
      try {
        await navigator.clipboard.writeText(pretty(value));
        copiedId.value = key(entry, argIndex);
        setTimeout(() => {
          copiedId.value = null;
        }, 1500);
      } catch {
        // clipboard unavailable; ignore
      }
    };

    const copyUrl = async (urlKey, url) => {
      try {
        await navigator.clipboard.writeText(url);
        copiedUrl.value = urlKey;
        setTimeout(() => {
          copiedUrl.value = null;
        }, 1500);
      } catch {
        // clipboard unavailable; ignore
      }
    };

    return {
      entries, expanded, copiedId, copiedUrl,
      key, icon, pretty, summary, segments, toggle, copy, copyUrl,
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
