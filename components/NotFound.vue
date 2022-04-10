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
