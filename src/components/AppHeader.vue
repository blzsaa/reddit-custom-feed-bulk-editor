<script setup lang="ts">
import ChangeSaver from "@/components/ChangeSaver.vue";
import { useMenuStore } from "@/store/MenuStore";

const menuStore = useMenuStore();
</script>

<template>
  <div class="card">
    <Toolbar>
      <template #start>
        <Button
          id="menu-btn"
          icon="pi pi-bars"
          @click="menuStore.toggle()"
          style="color: black"
          outlined
          class="mr-2"
        />
        <b>Reddit custom feed bulk editor</b>
      </template>
      <template #end>
        <change-saver />
      </template>
    </Toolbar>
  </div>
</template>
