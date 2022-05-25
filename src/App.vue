<script setup lang="ts">
import AppNotification from "@/components/AppNotification.vue";
</script>

<template>
  <router-view />
  <app-notification />
</template>

<style lang="sass">
@import 'primeflex/primeflex.scss'

.container
  @include styleclass('sm:w-12 md:w-10 lg:w-8 m-auto')
  max-width: 60rem
</style>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
