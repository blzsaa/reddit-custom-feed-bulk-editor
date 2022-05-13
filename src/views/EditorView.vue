<template>
  <Button class="p-button-rounded" @click="save()">Save</Button>
  <loading-mask
    :loading-stats="loadingState"
    v-if="isLoading || dataTableContent.length === 0"
  />
  <data-table
    v-else
    :value="dataTableContent"
    removableSort
    sortMode="multiple"
    :multiSortMeta="multiSortMeta"
    responsiveLayout="scroll"
    :reorderableColumns="true"
    v-model:filters="filters"
    filterDisplay="row"
    :loading="isLoading"
  >
    <template #empty
      >Did not found any subscribed subreddits nor any multis.</template
    >
    <template #loading>Loading subreddits-multis relationships.</template>
    <Column field="name" header="name" key="name" :sortable="true">
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
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import TriStateCheckbox from "primevue/tristatecheckbox";
import Checkbox from "primevue/checkbox";
import Button from "primevue/button";
import { useMultiFeedStore } from "@/store/MultifeedStore";
import { DatatableRow, DataTableFilter, LoadingStats } from "@/types";
import LoadingMask from "@/components/LoadingMask.vue";

const nameOfMultis = ref<string[]>([]);
const isLoading = ref<boolean>(false);
const dataTableContent = ref<DatatableRow[]>([]);
const filters = ref<DataTableFilter | undefined>(undefined);
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

onMounted(async () => {
  isLoading.value = true;

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
      const _exhaustiveCheck: never = a;
      console.log(_exhaustiveCheck);
    }
  });

  dataTableContent.value = multiFeedStore.dataTableContent;
  nameOfMultis.value = multiFeedStore.nameOfMultis;
  filters.value = multiFeedStore.filters;
  isLoading.value = false;
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

async function save() {
  multiFeedStore.commitChanges();
}
</script>
