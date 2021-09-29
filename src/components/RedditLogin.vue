<template>
  <div class="hello">
    <p>
      To use this page you first have to allow custom-feed-bulk-editor to access
      which subreddits and multireddits you are subscriber to.
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
  // send the user to the authentication url
  window.location.href =
    "https://www.reddit.com/api/v1/authorize?" +
    `client_id=${process.env.VUE_APP_CLIENT_ID}` +
    `&response_type=${process.env.VUE_APP_RESPONSE_TYPE}` +
    `&state=${process.env.VUE_APP_STATE}` +
    `&redirect_uri=${encodeURIComponent(process.env.VUE_APP_REDIRECT_URI)}` +
    `&scope=mysubreddits%20read%20subscribe`;
}
</script>
