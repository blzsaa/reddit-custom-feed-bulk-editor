<template>
  <Toast />
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
    <column field="name" header="name" key="name" :sortable="true">
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
    </column>
    <column
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
    </column>
    <column
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
    </column>
  </data-table>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onMounted } from "@vue/runtime-core";
import DataTable from "primevue/datatable/sfc";
import Column from "primevue/column/sfc";
import InputText from "primevue/inputtext/sfc";
import TriStateCheckbox from "primevue/tristatecheckbox/sfc";
import Checkbox from "primevue/checkbox/sfc";
import Button from "primevue/button/sfc";
import { useMultiFeedStore } from "@/store/MultifeedStore";
import { DatatableRow, DataTableFilter, LoadingStats } from "@/types";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
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
const toast = useToast();

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
  toast.add({ severity: "info", summary: "Saving changes", life: 3000 });
  multiFeedStore.commitChanges();
  toast.add({ severity: "success", summary: "Saved", life: 3000 });
}
</script>
