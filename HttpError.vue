<template>
  <br-error>
    <template v-slot:title>
      <slot name="title">
        Error
      </slot>
    </template>

    <template>
      <slot>
        <p>
          Sorry, an error was encountered.
        </p>
        <p v-if="status">
          Status: <strong>{{status}}</strong>
        </p>
        <p v-else-if="statusCode">
          Status Code: <strong>{{statusCode}}</strong>
        </p>
      </slot>
    </template>
  </br-error>
</template>
<script>
import BrError from './BrError.vue';
export default {
  name: 'HttpError',
  components: {
    BrError
  },
  computed: {
    status() {
      return this.$config.http.status;
    },
    statusCode() {
      return this.$config.http.statusCode;
    }
  }
};
</script>
<style>
</style>
