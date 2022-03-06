import { defineStore } from "pinia";
import { NotificationEvent } from "@/types";

export const useNotificationStore = defineStore("notification", {
  state: () => ({
    notifications: [] as NotificationEvent[],
  }),
  actions: {
    addNotification(notification: NotificationEvent) {
      this.notifications.push(notification);
    },
  },
});
