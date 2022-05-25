<template>
  <Dialog
    header="Please wait while loading data from Reddit, it could take a few minutes..."
    :visible="true"
    :modal="true"
    :closable="false"
  >
    <ul style="font-size: 2rem">
      <li>
        <loading-icon :predicator="loadingStats.loadedMultis > 0" /> Loaded
        {{ loadingStats.loadedMultis }} multis
      </li>
      <li>
        <loading-icon :predicator="loadingStats.loadedAllSubreddits" /> Loaded
        {{ loadingStats.loadedSubreddits }} subreddits
      </li>
      <li><loading-icon :predicator="false" /> Processing data...</li>
    </ul>
  </Dialog>

  <DataTable :value="Array(5)" responsiveLayout="scroll">
    <Column field="name" header="Name">
      <template #body>
        <Skeleton></Skeleton>
      </template>
    </Column>
    <Column field="category" header="subscribed">
      <template #body>
        <Skeleton></Skeleton>
      </template>
    </Column>
    <Column field="quantity" header="multi-reddit1">
      <template #body>
        <Skeleton></Skeleton>
      </template>
    </Column>
    <Column field="quantity" header="multi-reddit2">
      <template #body>
        <Skeleton></Skeleton>
      </template>
    </Column>
    <Column field="quantity" header="multi-reddit...">
      <template #body>
        <Skeleton></Skeleton>
      </template>
    </Column>
    <Column field="quantity" header="multi-redditN">
      <template #body>
        <Skeleton></Skeleton>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { LoadingStats } from "@/types";
import LoadingIcon from "@/components/LoadingIcon.vue";

defineProps<{
  loadingStats: LoadingStats;
}>();
</script>
