<script setup lang="ts">
import { useMenuStore } from "@/store/MenuStore";
import ColumnSelector from "@/components/ColumnSelector.vue";
import NewSubredditForm from "@/components/NewSubredditForm.vue";

defineProps<{
  columnOptions: { name: string; selected: boolean }[];
}>();

const menuStore = useMenuStore();

const emit = defineEmits<{
  updateSelectedColumns: [
    newSelectedColumns: { name: string; selected: boolean }[],
  ];
}>();

function updateSelectedColumns(
  newSelectedColumns: { name: string; selected: boolean }[],
): void {
  emit("updateSelectedColumns", newSelectedColumns);
}
</script>

<template>
  <Sidebar v-model:visible="menuStore.show" header="Menu">
    <div class="grid" v-show="menuStore.show" role="region">
      <div class="col-12">
        <new-subreddit-form />
        <Divider />
        <column-selector
          :column-options="columnOptions"
          @update-selected-columns="updateSelectedColumns"
        />
      </div>
    </div>
  </Sidebar>
</template>
