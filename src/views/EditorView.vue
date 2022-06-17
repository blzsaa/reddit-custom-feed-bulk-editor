<template>
  <loading-mask
    :loading-stats="loadingState"
    v-if="dataTableContent.length === 0"
  />
  <data-table
    :loading="loading"
    :value="dataTableContent"
    removableSort
    sortMode="multiple"
    :multiSortMeta="multiSortMeta"
    responsiveLayout="scroll"
    :reorderableColumns="true"
    v-model:filters="filters"
    filterDisplay="row"
    :scrollable="true"
    scrollHeight="flex"
    style="height: 100vh"
  >
    <template #header>
      <table-header />
    </template>
    <template #empty
      >Did not found any subscribed subreddits nor any multis.</template
    >
    <template #loading>Loading subreddits-multis relationships.</template>
    <Column
      field="name"
      class="name-column"
      body-class="name-column-body"
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
      v-for="multi of nameOfMultis"
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
import { ref } from "vue";
import { onMounted } from "@vue/runtime-core";
import { useMultiFeedStore } from "@/store/MultifeedStore";
import { DataTableFilter, DatatableRow, LoadingStats } from "@/types";
import LoadingMask from "@/components/LoadingMask.vue";
import TableHeader from "@/components/TableHeader.vue";

const nameOfMultis = ref<string[]>([]);
const dataTableContent = ref<DatatableRow[]>([]);
const filters = ref<DataTableFilter>({
  name: { value: null, matchMode: "contains" },
  subscribed: { value: null, matchMode: "equals" },
});
const multiFeedStore = useMultiFeedStore();
const multiSortMeta = ref<{ field: string; order: number }[]>([
  { field: "name", order: 1 },
]);
const loadingState = ref<LoadingStats>({
  loadedSubreddits: 0,
  loadedMultis: 0,
  processingData: false,
  loadedAllSubreddits: false,
});
const loading = ref(true);

onMounted(async () => {
  await multiFeedStore.initService();
  await multiFeedStore.readMultiFeedInformationFromReddit((a) => {
    if (a.kind === "processingData") {
      loadingState.value.processingData = true;
    } else if (a.kind === "LoadedSubreddits") {
      loadingState.value.loadedSubreddits = a.loadedSubreddits;
    } else if (a.kind === "LoadedMultis") {
      loadingState.value.loadedMultis = a.loadedMultis;
    } else if (a.kind === "LoadedAllSubreddits") {
      loadingState.value.loadedAllSubreddits = true;
    } else {
      console.log(a);
    }
  });

  dataTableContent.value = multiFeedStore.dataTableContent;
  nameOfMultis.value = Object.keys(multiFeedStore.dataTableContent[0]).filter(
    (a) => a !== "name" && a !== "subscribed"
  );
  filters.value = multiFeedStore.filters;
  loading.value = false;
});

const onChangeSubscriptionStatus = (
  newStatus: boolean,
  props: { name: string }
) => {
  multiFeedStore.changeSubscriptionStatus(props.name, newStatus);
};

const onChangeCustomFeedStatus = (
  nameOfTheMulti: string,
  nameOfTheSubreddit: string,
  newStatus: boolean
) => {
  multiFeedStore.changeCustomFeedStatus(
    nameOfTheMulti,
    nameOfTheSubreddit,
    newStatus
  );
};

function subredditLink(nameOfSubreddit: string) {
  return `${process.env.VUE_APP_REDDIT_URL}/r/${nameOfSubreddit}`;
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
.name-column {
  min-width: 200px;
}
.name-column-body {
  z-index: 1;
}
.p-column-filter-overlay {
  z-index: 2;
}
thead.p-datatable-thead {
  z-index: 2 !important;
}
.p-datatable .p-datatable-loading-overlay {
  z-index: 3 !important;
}
</style>
