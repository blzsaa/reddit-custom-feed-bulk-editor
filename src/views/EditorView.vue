<template>
  <div ref="appHeaderDiv">
    <app-header />
  </div>
  <app-side-menu
    :currently-selected-columns="currentlySelectedColumns"
    :all-columns="multiFeedStore.nameOfMultis"
    @update-selected-columns="updateSelectedColumns"
  />
  <loading-mask
    :loading-stats="loadingState"
    v-if="dataTableContent.length === 0"
  />
  <data-table
    v-else
    :value="dataTableContent"
    :paginator="true"
    :rows="100"
    :rowsPerPageOptions="[10, 25, 50, 100]"
    removableSort
    sortMode="multiple"
    :multiSortMeta="multiSortMeta"
    responsiveLayout="scroll"
    :reorderableColumns="true"
    v-model:filters="filters"
    filterDisplay="row"
    :scrollable="true"
    scrollHeight="flex"
    :style="`height: calc(100vh - ${appHeaderDiv?.clientHeight || 0}px);`"
  >
    <template #empty
      >Did not found any subscribed subreddits nor any multis.</template
    >
    <template #loading>Loading subreddits-multis relationships.</template>
    <Column
      field="name"
      style="min-width: 200px; z-index: 1"
      frozen
      header="name"
      key="name"
      :sortable="true"
    >
      <template #body="{ data }">
        <a
          :class="data.name + '_name'"
          :href="subredditLink(data.name)"
          target="_blank"
          >{{ data.name }}
        </a>
      </template>
      <template #filter="{ filterModel, filterCallback }">
        <input-text
          type="text"
          v-model="filterModel.value"
          @keydown.enter="filterCallback()"
          class="p-column-filter"
          :placeholder="`Search by name - ${filterModel.matchMode}`"
          v-tooltip.top.focus="'Hit enter key to filter'"
        />
      </template>
    </Column>
    <Column
      field="subscribed"
      header="subscribed"
      key="subscribed"
      :sortable="true"
      dataType="boolean"
    >
      <template #body="{ data }">
        <Checkbox
          :class="data.name + '_subscribed'"
          v-model="data.subscribed"
          :binary="true"
          @update:modelValue="onChangeSubscriptionStatus($event, data)"
        />
      </template>
      <template #filter="{ filterModel, filterCallback }">
        <TriStateCheckbox
          v-model="filterModel.value"
          @change="filterCallback()"
        />
      </template>
    </Column>
    <Column
      v-for="multi of currentlySelectedColumns"
      :field="multi"
      :header="multi"
      :key="multi"
      :sortable="true"
      dataType="boolean"
    >
      <template #body="slotProps">
        <Checkbox
          v-model="slotProps.data[multi]"
          :class="slotProps.data.name + '_' + multi"
          :binary="true"
          @update:modelValue="
            onChangeCustomFeedStatus(multi, slotProps.data.name, $event)
          "
        />
      </template>
      <template #filter="{ filterModel, filterCallback }">
        <tri-state-checkbox
          v-model="filterModel.value"
          @change="filterCallback()"
        />
      </template>
    </Column>
  </data-table>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useMultiFeedStore } from "@/store/MultifeedStore";
import { useNotificationStore } from "@/store/NotificationStore";
import type { DatatableRow, LoadingStats } from "@/types";
import { NotificationEvent } from "@/types";
import LoadingMask from "@/components/LoadingMask.vue";
import type {
  DataTableFilterMeta,
  DataTableSortMeta,
} from "primevue/datatable";
import AppHeader from "@/components/AppHeader.vue";
import AppSideMenu from "@/components/AppSideMenu.vue";

const currentlySelectedColumns = ref<string[]>([]);
const dataTableContent = ref<DatatableRow[]>([]);
const filters = ref<DataTableFilterMeta | undefined>(undefined);
const multiFeedStore = useMultiFeedStore();
const notificationStore = useNotificationStore();
const multiSortMeta = ref<DataTableSortMeta[]>([{ field: "name", order: 1 }]);
const loadingState = ref<LoadingStats>({
  loadedSubreddits: 0,
  loadedMultis: 0,
  dataProcessed: false,
  loadedAllSubreddits: false,
});

onMounted(async () => {
  await multiFeedStore.initService();
  await multiFeedStore.readMultiFeedInformationFromReddit((a) => {
    if (a.kind === "DataProcessed") {
      loadingState.value.dataProcessed = true;
    } else if (a.kind === "LoadedSubreddits") {
      loadingState.value.loadedSubreddits = a.loadedSubreddits;
    } else if (a.kind === "LoadedMultis") {
      loadingState.value.loadedMultis = a.loadedMultis;
    } else if (a.kind === "LoadedAllSubreddits") {
      loadingState.value.loadedAllSubreddits = true;
      loadingState.value.loadedSubreddits = a.loadedSubreddits;
    } else {
      console.log(a);
    }
  });

  dataTableContent.value = multiFeedStore.dataTableContent;
  currentlySelectedColumns.value = multiFeedStore.nameOfMultis;
  filters.value = multiFeedStore.filters;
});

const onChangeSubscriptionStatus = (
  newStatus: boolean,
  props: { name: string },
) => {
  multiFeedStore.changeSubscriptionStatus(props.name, newStatus);
};

const onChangeCustomFeedStatus = (
  nameOfTheMulti: string,
  nameOfTheSubreddit: string,
  newStatus: boolean,
) => {
  multiFeedStore.changeCustomFeedStatus(
    nameOfTheMulti,
    nameOfTheSubreddit,
    newStatus,
  );
};

const appHeaderDiv = ref<HTMLElement | undefined>(undefined);

function subredditLink(nameOfSubreddit: string) {
  return `${import.meta.env.VITE_REDDIT_URL}/r/${nameOfSubreddit}`;
}

function updateSelectedColumns(newSelectedColumns: string[]): void {
  currentlySelectedColumns.value = newSelectedColumns;
  notificationStore.addNotification(
    new NotificationEvent("success", "Updated which multis to show", ""),
  );
}
</script>
<style>
body,
html {
  margin: 0;
  padding: 0;
}
* {
  box-sizing: border-box;
}
.p-datatable-thead {
  z-index: 2 !important;
}
</style>
