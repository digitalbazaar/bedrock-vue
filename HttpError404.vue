<template>
  <http-error>
    <template v-slot:title>
      Page Not Found
    </template>

    <p>Sorry, the resource you requested was not found.</p>
  </http-error>
</template>
<script>
import HttpError from './HttpError.vue';
export default {
  name: 'HttpError404',
  components: {
    HttpError
  }
};
</script>
<style>
</style>
