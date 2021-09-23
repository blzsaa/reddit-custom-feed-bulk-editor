<template>
  <div>
    <DataTable
      :value="dataTableContent"
      responsiveLayout="scroll"
      :reorderableColumns="true"
    >
      <Column v-for="col of headers" :field="col" :header="col" :key="col">
        <template v-if="col !== 'name'" #body="slotProps">
          <Checkbox
            id="binary"
            v-model="slotProps.data[col]"
            :binary="true"
            :disabled="true"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "@vue/runtime-core";
import DataTable from "primevue/datatable/sfc";
import Column from "primevue/column/sfc";
import Checkbox from "primevue/checkbox/sfc";

import { ref } from "vue";
import { useMultiFeedStore } from "@/store/MultifeedStore";

const headers = ref<string[]>([]);
const dataTableContent = ref<{ name: string }[]>([]);
const multiFeedStore = useMultiFeedStore();

onMounted(async () => {
  multiFeedStore.extractAccessToken(window.location);
  await multiFeedStore.readMultiFeedInformationFromReddit();

  dataTableContent.value = multiFeedStore.dataTableContent;
  headers.value = multiFeedStore.headers;
});
</script>
