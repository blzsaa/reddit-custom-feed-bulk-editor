<script setup lang="ts">
import { useMultiFeedStore } from "@/store/MultifeedStore";

const multiFeedStore = useMultiFeedStore();

async function save() {
  await multiFeedStore.commitChanges();
}
</script>

<template>
  <Button
    icon="pi pi-check"
    :disabled="!multiFeedStore.isValid"
    @click="save()"
    label="save"
  />
</template>
