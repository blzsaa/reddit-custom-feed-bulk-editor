<script setup lang="ts">
import { reactive, ref } from "vue";
import { useMultiFeedStore } from "@/store/MultifeedStore";
import { onMounted } from "@vue/runtime-core";
import { helpers, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import {
  mustBeAnExistingSubreddit,
  mustBeNotAlreadyInDataTable,
} from "@/service/validators";
import { MultisService } from "@/service/MultisService";

const multiFeedStore = useMultiFeedStore();
const filteredSubreddits = ref();

const state = reactive({
  newSubreddit: "",
});

const rules = {
  newSubreddit: {
    required,
    mustBeNotAlreadyInDataTable: helpers.withMessage(
      "Subreddit is already in the data table",
      (value: string) =>
        mustBeNotAlreadyInDataTable(value, multiFeedStore.dataTableContent)
    ),
    mustBeAnExistingSubreddit2: helpers.withMessage(
      "There is no subreddits with this name",
      helpers.withAsync(async (value: string) =>
        mustBeAnExistingSubreddit(
          value,
          multiFeedStore.multisService as MultisService
        )
      )
    ),
    $lazy: true,
  },
};
const submitted = ref(false);
const v$ = useVuelidate(rules, state, { $rewardEarly: true });
const input = ref<HTMLDivElement | undefined>(undefined);

onMounted(async () => {
  await multiFeedStore.initService();
  input?.value?.focus();
});

async function addNewSubreddit() {
  const result = await v$.value.$validate();
  submitted.value = true;
  if (!result) {
    return;
  }

  multiFeedStore.dataTableContent.push({
    name: state.newSubreddit,
    subscribed: false,
  });

  state.newSubreddit = "";
  submitted.value = false;
}

const searchSubreddit = async (event: { query: string }) => {
  if (event.query.trim()) {
    filteredSubreddits.value =
      await multiFeedStore.multisService.searchSubreddit(event.query.trim());
  }
};
</script>

<template>
  <form @submit.prevent="addNewSubreddit()">
    <div class="grid">
      <div class="col">
        <span class="p-float-label">
          <AutoComplete
            ref="input"
            :suggestions="filteredSubreddits"
            @complete="searchSubreddit($event)"
            v-model.trim="v$.newSubreddit.$model"
            @blur="v$.newSubreddit.$commit"
            :class="{
              'p-invalid': v$.newSubreddit.$invalid && submitted,
            }"
            class="flex-row"
          />
          <label for="name">new subreddit</label>
        </span>
        <div class="fc-row" v-if="submitted">
          <p v-for="error of v$.$errors" :key="error.$uid">
            <small class="p-error">{{ error.$message }}</small>
          </p>
        </div>
      </div>
      <div class="col">
        <Button
          id="add-new-subreddit-button"
          type="submit"
          icon="pi pi-check"
          label="OK"
        />
      </div>
    </div>
  </form>
</template>
