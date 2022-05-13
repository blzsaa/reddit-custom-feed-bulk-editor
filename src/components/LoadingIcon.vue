<script setup lang="ts">
defineProps<{
  predicator: boolean;
}>();
</script>

<template>
  <i class="pi pi-check" style="font-size: 2rem" v-if="predicator"></i>
  <i class="pi pi-spin pi-spinner" style="font-size: 2rem" v-else></i>
</template>
