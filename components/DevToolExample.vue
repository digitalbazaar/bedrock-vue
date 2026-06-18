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
  Reference dev tool. This component is a documentation sample showing the
  shape of a tool registered via `registerDevTool({id, label, component})`.
  It is NOT registered by `@bedrock/vue`; consumers register their own tools.
  See the "Developer Mode" section of the README for how to register it.
-->

<template>
  <div class="dev-tool-example">
    <p>Clicked {{count}} time(s).</p>
    <button
      type="button"
      @click="onClick">
      Click me
    </button>
  </div>
</template>

<script>
import {ref} from 'vue';

export default {
  name: 'DevToolExample',
  setup() {
    const count = ref(0);
    const onClick = () => {
      count.value++;
    };
    return {count, onClick};
  }
};
</script>

<style scoped>
.dev-tool-example button {
  cursor: pointer;
}
</style>
