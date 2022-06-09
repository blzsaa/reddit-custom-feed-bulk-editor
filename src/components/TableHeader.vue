<script setup lang="ts">
import { ref } from "vue";
import { useMultiFeedStore } from "@/store/MultifeedStore";
import { onMounted } from "@vue/runtime-core";
import OverlayPanel from "primevue/overlaypanel";
import NewSubredditForm from "@/components/NewSubredditForm.vue";

const multiFeedStore = useMultiFeedStore();
const op = ref<OverlayPanel>();

onMounted(async () => {
  await multiFeedStore.initService();
});

async function save() {
  await multiFeedStore.commitChanges();
}
const toggle = (event: Event) => {
  op.value?.toggle(event);
};
</script>

<template>
  <div>
    <div>
      <Button
        id="save-button"
        icon="pi pi-check"
        @click="save()"
        label="save"
        style="float: left"
      />
      <Button
        id="open-add-new-subreddit-form-button"
        type="button"
        @click="toggle"
        icon="pi pi-search"
        class="p-button-warning"
        label="new subreddit"
        aria:haspopup="true"
        aria-controls="overlay_panel"
        style="float: left"
      />

      <OverlayPanel
        ref="op"
        appendTo="body"
        :showCloseIcon="true"
        id="overlay_panel"
      >
        <br />
        <new-subreddit-form />
      </OverlayPanel>
    </div>
    Add or remove subreddits from custom-feeds
  </div>
</template>
