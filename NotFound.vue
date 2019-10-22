<template>
  <div>
    <h2>Page Not Found</h2>
    <div>
      <p>Sorry, but the page you requested was not found.</p>
      <p v-if="supportEmail">If you believe this is an error, please contact
      <a :href="`mailto:${supportEmail}`">support</a>.</p>
    </div>
  </div>
</template>
<script>
export default {
  name: 'NotFound',
  computed: {
    supportEmail() {
      return this.$config.contacts.support.email;
    }
  }
};
</script>
<style>
</style>
