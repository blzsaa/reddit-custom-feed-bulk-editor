<template>
  <div class="home">
    <reddit-login />
    <hr />
    <about />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import RedditLogin from "@/components/RedditLogin.vue";
import About from "@/components/AboutPart.vue";

export default defineComponent({
  name: "HomeView",
  components: {
    RedditLogin,
    About,
  },
});
</script>
