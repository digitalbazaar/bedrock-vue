<template>
  <div>
    <h2><slot name="title" /></h2>
    <slot />
    <slot name="contact" />
  </div>
</template>
<script>
export default {
  name: 'BrErrorBase'
};
</script>
<style>
</style>
