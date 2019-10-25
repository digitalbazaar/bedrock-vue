<template>
  <http-error>
    <template v-slot:title>
      Service Unavailable
    </template>

    <p>Sorry, this service is temporarily unavailable.</p>
  </http-error>
</template>
<script>
import HttpError from './HttpError.vue';
export default {
  name: 'HttpError503',
  components: {
    HttpError
  }
};
</script>
<style>
</style>
