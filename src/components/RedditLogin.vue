<template>
  <div class="hello">
    <p>
      To use this page you first have to allow reddit-custom-feed-bulk-editor to
      access which subreddits and multireddits you are subscriber to.
    </p>
    <a :href="linkToRedditAuthenticationPage()">
      <Chip
        class="p-mr-2 p-mb-2 custom-chip"
        label="Login with reddit account"
        image="https://www.redditstatic.com/desktop2x/img/favicon/favicon-32x32.png"
      />
    </a>
  </div>
</template>

<script setup lang="ts">
import Chip from "primevue/chip/sfc";

function linkToRedditAuthenticationPage() {
  const redirectUri = "http://localhost:8080/authorize_callback";
  const responseType = "token";
  const state = "STATE";
  const scopes = ["mysubreddits", "read", "subscribe"];
  // send the user to the authentication url
  return (
    "https://www.reddit.com/api/v1/authorize?" +
    `client_id=${process.env.VUE_APP_CLIENT_ID}` +
    `&response_type=${responseType}` +
    `&state=${state}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scopes.join(" "))}`
  );
}
</script>

<style scoped>
.custom-chip {
  background: var(--primary-color);
  color: var(--primary-color-text);
}
a {
  text-decoration: none;
}
</style>
