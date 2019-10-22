<template>
  <div>
    <h2>Page Not Found</h2>
    <div>
      <p>Sorry, but the page you requested was not found.</p>
      <p v-if="supportEmail">If this problem persists, please contact
      <a :href="`mailto:${supportEmail}`">Customer Support</a>.</p>
    </div>
  </div>
</template>
<script>
export default {
  name: 'NotFound',
  computed: {
    supportEmail() {
      return this.$config.supportEmail;
    }
  }
};
</script>
<style>
</style>
