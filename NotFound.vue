<template>
  <div>
    <h2>Page Not Found</h2>
    <div>
      <p>Sorry, but the page you requested was not found.</p>
      <p>If this problem persists, please contact
      <a :href="`mailto:support@${supportDomain}`">Customer Support</a>.</p>
    </div>
  </div>
</template>
<script>
export default {
  name: 'NotFound',
  computed: {
    supportDomain() {
      return this.$config.data.supportDomain;
    }
  }
};
</script>
<style>
</style>
