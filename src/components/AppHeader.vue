<script setup lang="ts">
import ChangeSaver from "@/components/ChangeSaver.vue";
</script>

<template>
  <div class="card">
    <Toolbar>
      <template #start>
        <b>Reddit custom feed bulk editor</b>
      </template>
      <template #end>
        <change-saver />
      </template>
    </Toolbar>
  </div>
</template>
