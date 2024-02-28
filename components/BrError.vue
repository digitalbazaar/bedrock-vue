<!--
Copyright 2024 Digital Bazaar, Inc.

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
  <component :is="base">
    <template #title>
      <slot name="title" />
    </template>
    <slot />
    <template #contact>
      <slot name="contact">
        <p v-if="supportEmail">
          If you believe this is an error, please contact
          <a :href="`mailto:${supportEmail}`">support</a>.
        </p>
      </slot>
    </template>
  </component>
</template>

<script>
export default {
  name: 'BrError',
  computed: {
    base() {
      return this.$config.ui.components['br-error-base'];
    },
    supportEmail() {
      return this.$config.contacts.support.email;
    }
  }
};
</script>

<style>
</style>
