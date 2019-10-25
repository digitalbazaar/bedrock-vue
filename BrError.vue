<template>
  <component :is="base">
    <template v-slot:title>
      <slot name="title" />
    </template>
    <slot />
    <template v-slot:contact>
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
