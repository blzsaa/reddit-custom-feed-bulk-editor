<script setup lang="ts">
import { useMenuStore } from "@/store/MenuStore";
import ColumnSelector from "@/components/ColumnSelector.vue";
import NewSubredditForm from "@/components/NewSubredditForm.vue";

defineProps<{
  currentlySelectedColumns: string[];
  allColumns: string[];
}>();

const menuStore = useMenuStore();

const emit = defineEmits<{
  updateSelectedColumns: [newSelectedColumns: string[]];
}>();

function updateSelectedColumns(newSelectedColumns: string[]): void {
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
          :currently-selected-columns="currentlySelectedColumns"
          :all-columns="allColumns"
          @update-selected-columns="updateSelectedColumns"
        />
      </div>
    </div>
  </Sidebar>
</template>
