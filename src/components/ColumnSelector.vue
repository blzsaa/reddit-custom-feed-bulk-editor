<script setup lang="ts">
import { ref } from "vue";

const p = defineProps<{
  currentlySelectedColumns: string[];
  allColumns: string[];
}>();

const emit = defineEmits<{
  updateSelectedColumns: [newSelectedColumns: string[]];
}>();

const selectedColumns = ref<string[]>(p.currentlySelectedColumns);

function update(): void {
  emit("updateSelectedColumns", selectedColumns.value);
}
</script>

<template>
  <form @submit.prevent="update">
    <div class="grid">
      <div class="col-12">
        <label for="ms-cities" class="font-bold">Show or hide multis</label>
      </div>
      <div class="col-12">
        <MultiSelect
          v-model="selectedColumns"
          :options="allColumns"
          filter
          placeholder="Select multis"
          :maxSelectedLabels="3"
          class="w-full"
          id="ms-cities"
        />
      </div>
      <div class="col-12">
        <Button
          id="add-new-subreddit-button"
          type="submit"
          icon="pi pi-check"
          label="Save changes"
          outlined
        />
      </div>
    </div>
  </form>
</template>
