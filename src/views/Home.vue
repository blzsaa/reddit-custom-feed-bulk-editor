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
import About from "@/components/About.vue";

export default defineComponent({
  name: "Home",
  components: {
    RedditLogin,
    About,
  },
});
</script>
