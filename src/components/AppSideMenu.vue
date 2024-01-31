<script setup lang="ts">
import { useMenuStore } from "@/store/MenuStore";
import NewSubredditForm from "@/components/NewSubredditForm.vue";

const menuStore = useMenuStore();
</script>

<template>
  <Sidebar v-model:visible="menuStore.show" header="Menu">
    <div class="grid" v-show="menuStore.show" role="region">
      <div class="col-12">
        <new-subreddit-form />
      </div>
    </div>
  </Sidebar>
</template>
