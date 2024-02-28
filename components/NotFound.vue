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
  <br-error>
    <template #title>
      Page Not Found
    </template>

    <p>Sorry, the resource you requested was not found.</p>
  </br-error>
</template>

<script>
import BrError from './BrError.vue';

export default {
  name: 'NotFound',
  components: {
    BrError
  }
};
</script>

<style>
</style>
