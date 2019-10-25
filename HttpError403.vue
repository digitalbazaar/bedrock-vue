<template>
  <http-error>
    <template v-slot:title>
      Forbidden
    </template>

    <p>Sorry, you are not authorized to access this resource.</p>
  </http-error>
</template>
<script>
import HttpError from './HttpError.vue';
export default {
  name: 'HttpError403',
  components: {
    HttpError
  }
};
</script>
<style>
</style>
