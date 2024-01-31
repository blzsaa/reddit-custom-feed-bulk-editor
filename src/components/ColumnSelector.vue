<script setup lang="ts">
import { ref } from "vue";
import { useNotificationStore } from "@/store/NotificationStore";
import { NotificationEvent } from "@/types";

const notificationStore = useNotificationStore();

const p = defineProps<{
  columnOptions: { name: string; selected: boolean }[];
}>();

const emit = defineEmits<{
  updateSelectedColumns: [
    newSelectedColumns: { name: string; selected: boolean }[],
  ];
}>();

const selectedColumns = ref<{ name: string; selected: boolean }[]>(
  p.columnOptions,
);

function update(): void {
  notificationStore.addNotification(
    new NotificationEvent("info", "Updating which multis to show", ""),
  );
  const newSelectedColumns = p.columnOptions.map((c) => ({
    name: c.name,
    selected: !!selectedColumns.value.find(
      (s) => s.name === c.name && s.selected === c.selected,
    ),
  }));
  emit("updateSelectedColumns", newSelectedColumns);
  notificationStore.addNotification(
    new NotificationEvent("success", "Updated which multis to show", ""),
  );
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
          :options="columnOptions"
          filter
          placeholder="Select multis"
          :maxSelectedLabels="3"
          optionLabel="name"
          class="w-full"
          id="ms-cities"
          display="chip"
        >
          <template #option="slotProps">
            <div>{{ slotProps.option.name }}</div>
          </template>
          <template #footer>
            <div class="py-2 px-3">
              <b>{{ selectedColumns ? selectedColumns.length : 0 }}</b>
              multi-reddits{{
                (selectedColumns ? selectedColumns.length : 0) > 1 ? "s" : ""
              }}
              selected.
            </div>
          </template>
        </MultiSelect>
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
