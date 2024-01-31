<script setup lang="ts">
import { ref } from "vue";
import { useMultiFeedStore } from "@/store/MultifeedStore";
import { validateSubredditName } from "@/service/SubredditNameValidator";
import { MultisService } from "@/service/MultisService";
import { useNotificationStore } from "@/store/NotificationStore";
import { NotificationEvent } from "@/types";

const multiFeedStore = useMultiFeedStore();
const notificationStore = useNotificationStore();

const dataTableContent = multiFeedStore.dataTableContent;
const multisService = multiFeedStore.multisService as MultisService;

const filteredSubreddits = ref();

const newSubreddit = ref<string | undefined>(undefined);

async function addNewSubreddit() {
  notificationStore.addNotification(
    new NotificationEvent("info", "Adding subreddit", ""),
  );
  const result = await validateSubredditName(
    newSubreddit.value,
    dataTableContent,
    multisService,
  );
  if (result) {
    const notificationEvent = new NotificationEvent("error", result, "");
    notificationStore.addNotification(notificationEvent);
    return;
  }

  dataTableContent.push({
    name: newSubreddit.value!!,
    subscribed: false,
  });

  notificationStore.addNotification(
    new NotificationEvent("success", "Added", ""),
  );
  newSubreddit.value = undefined;
}

const searchSubreddit = async (event: { query: string }) => {
  const trimmed = event.query.trim();
  if (trimmed) {
    filteredSubreddits.value =
      await multisService.findSubredditsByPrefix(trimmed);
  }
};
</script>

<template>
  <form @submit.prevent="addNewSubreddit()">
    <div class="grid">
      <div class="col-12">
        <label for="ac" class="font-bold">Add new subreddit</label>
      </div>
      <div class="col-12">
        <AutoComplete
          :suggestions="filteredSubreddits"
          @complete="searchSubreddit($event)"
          v-model="newSubreddit"
          inputId="ac"
          class="w-full"
          input-class="w-full"
        />
      </div>
      <div class="col-12">
        <Button
          id="add-new-subreddit-button"
          type="submit"
          icon="pi pi-check"
          label="Add new subreddit"
          outlined
        />
      </div>
    </div>
  </form>
</template>
