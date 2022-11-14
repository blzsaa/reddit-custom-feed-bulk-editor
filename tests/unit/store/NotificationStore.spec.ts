import { describe, beforeEach, it, expect } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { NotificationEvent } from "@/types";
import { useNotificationStore } from "@/store/NotificationStore";

describe("Notification Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("after adding NotificationEvents to store", function () {
    it("should store them", () => {
      const store = useNotificationStore();
      const notificationEvent1 = new NotificationEvent("info", "title1");
      const notificationEvent2 = new NotificationEvent("info", "title2");

      store.addNotification(notificationEvent1);
      store.addNotification(notificationEvent2);

      expect(store.notifications).to.have.deep.members([
        notificationEvent1,
        notificationEvent2,
      ]);
    });
  });
});
