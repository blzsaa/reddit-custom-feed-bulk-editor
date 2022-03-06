<script setup lang="ts">
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import { useNotificationStore } from "@/store/NotificationStore";
import { NotificationEvent } from "@/types";
import { watch } from "vue";
const toast = useToast();
const notificationStore = useNotificationStore();

watch(
  notificationStore.notifications,
  (notifications: NotificationEvent[]) => {
    const notification = notifications.pop();
    if (notification) {
      toast.add(notification);
    }
  },
  { deep: true }
);
</script>

<template>
  <Toast />
</template>
