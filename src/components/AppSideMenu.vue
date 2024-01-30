<script setup lang="ts">
import { useMenuStore } from "@/store/MenuStore";

const menuStore = useMenuStore();
</script>

<template>
  <Sidebar v-model:visible="menuStore.show" header="Menu">
    <div class="grid" v-show="menuStore.show" role="region"></div>
  </Sidebar>
</template>
