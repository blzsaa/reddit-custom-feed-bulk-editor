<template>
  <div>
    <data-table
      :value="dataTableContent"
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
      <column field="name" header="name">
        <template #body="{ data }">
          {{ data.name }}
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
        v-for="col of headers.filter((a) => a !== 'name')"
        :field="col"
        :header="col"
        :key="col"
        dataType="boolean"
      >
        <template #body="slotProps">
          <em
            class="pi"
            :class="{
              'true-icon pi-check-circle': slotProps.data[col],
              'false-icon pi-times-circle': !slotProps.data[col],
            }"
          ></em>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <tri-state-checkbox
            v-model="filterModel.value"
            @change="filterCallback()"
          />
        </template>
      </column>
    </data-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onMounted } from "@vue/runtime-core";
import { FilterMatchMode, FilterService } from "primevue/api";
import DataTable from "primevue/datatable/sfc";
import Column from "primevue/column/sfc";
import InputText from "primevue/inputtext/sfc";
import TriStateCheckbox from "primevue/tristatecheckbox/sfc";
import { useMultiFeedStore } from "@/store/MultifeedStore";
import { DataTableFilter } from "@/types";

const headers = ref<string[]>([]);
const isLoading = ref<boolean>(false);
const dataTableContent = ref<{ name: string }[]>([]);
const filters = ref<DataTableFilter>({
  name: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const multiFeedStore = useMultiFeedStore();

onMounted(async () => {
  isLoading.value = true;

  FilterService.register(
    "filterEitherTrueOrNullValues",
    (
      valueToBeFiltered: boolean | null | undefined,
      filterValue: boolean | null | undefined
    ) => {
      if (filterValue === null || filterValue === undefined) {
        return true;
      } else if (filterValue) {
        return valueToBeFiltered;
      } else {
        return !valueToBeFiltered;
      }
    }
  );

  multiFeedStore.extractAccessToken(window.location);
  await multiFeedStore.readMultiFeedInformationFromReddit();

  dataTableContent.value = multiFeedStore.dataTableContent;
  headers.value = multiFeedStore.headers;
  filters.value = multiFeedStore.filters;
  isLoading.value = false;
});
</script>

<style>
.false-icon {
  color: darkred;
}
.true-icon {
  color: green;
}
</style>
