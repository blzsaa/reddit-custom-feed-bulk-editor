<template>
  <div class="hello">
    <p>
      To use this page you first have to allow reddit-custom-feed-bulk-editor to
      access which subreddits and multireddits you are subscriber to.
    </p>
    <Button
      class="p-button-rounded"
      @click="redirectToRedditAuthenticationPage"
    >
      Login with reddit account
    </Button>
  </div>
</template>

<script setup lang="ts">
import Button from "primevue/button/sfc";

function redirectToRedditAuthenticationPage() {
  const redirectUri = "http://localhost:8080/authorize_callback";
  const responseType = "token";
  const state = "STATE";
  const scopes = ["mysubreddits", "read", "subscribe"];
  // send the user to the authentication url
  window.location.href =
    "https://www.reddit.com/api/v1/authorize?" +
    `client_id=${process.env.VUE_APP_CLIENT_ID}` +
    `&response_type=${responseType}` +
    `&state=${state}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scopes.join(" "))}`;
}
</script>
