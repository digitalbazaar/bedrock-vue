<template>
  <div>
    <br-header></br-header>
    <router-view></router-view>
    <br-footer></br-footer>

    <!-- <br-route-loading v-if="route.changing"></br-route-loading>
    <div v-else>
      <router-view></router-view>
      <br-footer></br-footer>
    </div> -->
  </div>
</template>
<script>
export default {
  name: 'br-app'
};
</script>
<style>
</style>
