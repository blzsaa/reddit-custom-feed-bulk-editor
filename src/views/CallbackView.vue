<template>
  <h1>
    REDIRECTING...
    <ProgressSpinner style="width: 30px; height: 30px" strokeWidth="8" />
  </h1>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useMultiFeedStore } from "@/store/MultifeedStore";
import router from "@/router";

const multiFeedStore = useMultiFeedStore();

onMounted(async () => {
  await multiFeedStore.extractAccessToken(window.location.href);
  await router.push("/editor");
});
</script>
