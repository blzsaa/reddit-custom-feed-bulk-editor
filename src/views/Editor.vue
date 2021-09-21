<template>
  <div>
    <data-table :value="subscribedSubreddits" responsiveLayout="scroll">
      <column field="display_name" header="Subreddit"></column>
    </data-table>
  </div>
</template>

<script setup lang="ts">
import { Subreddit } from "@/types/Subreddit";
import { onMounted } from "@vue/runtime-core";
import { RedditApi } from "@/api/RedditApi";
import DataTable from "primevue/datatable/sfc";
import Column from "primevue/column/sfc";

import { ref } from "vue";

const subscribedSubreddits = ref<Subreddit[]>([]);

onMounted(async () => {
  var hash = window.location.hash.substr(1);

  var result: { access_token: string } = hash
    .split("&")
    .reduce(function (res, item) {
      var parts = item.split("=");
      res[parts[0]] = parts[1];
      return res;
    }, {});

  const redditApi = new RedditApi(result["access_token"]);
  subscribedSubreddits.value = await redditApi.getSubscribedSubreddits();
  const a = await redditApi.getMultiMine();
});
</script>
