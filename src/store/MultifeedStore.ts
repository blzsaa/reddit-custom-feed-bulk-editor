import { defineStore } from "pinia";
import {
  Action,
  type DatatableRow,
  type LoadingStatsCallback,
  MultiReddit,
  NotificationEvent,
  Subreddit,
} from "@/types";
import { MultisService } from "@/service/MultisService";
import { AccessTokenFactory } from "@/service/AccessTokenFactory";
import { generateFiltersForDataTable } from "@/service/DataTableCustomFilterService";
import ky from "ky";
import { RedditApi } from "@/api/RedditApi";
import router from "@/router";
import { useNotificationStore } from "@/store/NotificationStore";
import { markRaw } from "vue";
import type { DataTableFilterMeta } from "primevue/datatable";

export const useMultiFeedStore = defineStore("multi-feed", {
  state: () => ({
    accessToken: "" as string,
    nameOfMultis: [] as string[],
    dataTableContent: [] as DatatableRow[],
    subredditChanges: new Map<string, Action>(),
    subreddits: [] as Subreddit[],
    multis: [] as MultiReddit[],
    changedMultis: new Set<MultiReddit>(),
    multisService: {} as MultisService,
    filters: {} as DataTableFilterMeta,
    router: markRaw(router),
  }),
  getters: {
    isValid: (state) => {
      const isValid = Array.from(state.changedMultis).every((m) => {
        return m.subreddits.size <= 100;
      });
      if (!isValid) {
        const notificationStore = useNotificationStore();
        notificationStore.addNotification(
          new NotificationEvent(
            "error",
            `Custom feeds cannot have more than 100 subreddits`,
          ),
        );
      }
      return isValid;
    },
  },
  persist: {
    paths: ["accessToken"],
  },
  actions: {
    async extractAccessToken(href: string) {
      this.accessToken = await new AccessTokenFactory().extractAccessToken(
        ky.extend({
          prefixUrl: import.meta.env.VITE_REDDIT_URL,
          timeout: 5000,
        }),
        href,
      );
    },
    async initService() {
      const api = ky.extend({
        prefixUrl: import.meta.env.VITE_OAUTH_REDDIT_URL,
        timeout: 5000,
        hooks: {
          beforeRequest: [
            (request) => {
              request.headers.set(
                "Authorization",
                "bearer " + this.accessToken,
              );
            },
          ],
          beforeError: [
            (error) => {
              const notificationStore = useNotificationStore();
              if (error.response.status === 401) {
                this.accessToken = "";
                notificationStore.addNotification(
                  new NotificationEvent(
                    "error",
                    "Timeout",
                    "Please reauthenticate",
                  ),
                );
                router.push({ path: "/" });
              }
              return error;
            },
          ],
        },
      });

      this.multisService = new MultisService(new RedditApi(api));
    },
    async readMultiFeedInformationFromReddit(
      callbackFunction: (stats: LoadingStatsCallback) => void,
    ) {
      await Promise.all([
        this.multisService
          .getSubscribedSubreddits((n) =>
            callbackFunction({
              kind: "LoadedSubreddits",
              loadedSubreddits: n,
            }),
          )
          .then((m) => {
            callbackFunction({
              kind: "LoadedAllSubreddits",
              loadedSubreddits: m.length,
            });
            this.subreddits = m;
          }),
        this.multisService.getMultiMine().then((m) => {
          callbackFunction({ kind: "LoadedMultis", loadedMultis: m.length });
          this.multis = m;
        }),
      ]);
      this.nameOfMultis = this.multisService.getNameOfMultis(this.multis);
      this.filters = generateFiltersForDataTable(this.multis);
      this.dataTableContent = this.multisService.mapToDatatableRows(
        this.subreddits,
        this.multis,
      );
      callbackFunction({ kind: "DataProcessed" });
    },
    changeSubscriptionStatus(name: string, newValue: boolean) {
      if (newValue) {
        this.subredditChanges.set(name, Action.Subscribe);
      } else {
        this.subredditChanges.set(name, Action.Unsubscribe);
      }
    },
    changeCustomFeedStatus(
      nameOfTheMulti: string,
      nameOfTheSubreddit: string,
      newStatus: boolean,
    ) {
      const find = this.multis.find((a) => a.display_name == nameOfTheMulti);
      if (!find) {
        return;
      }
      this.changedMultis.add(find);
      if (newStatus) {
        find.subreddits.add(nameOfTheSubreddit);
      } else {
        find.subreddits.delete(nameOfTheSubreddit);
      }
      console.log(find.subreddits.size > 100);
    },
    async commitChanges() {
      const notificationStore = useNotificationStore();
      notificationStore.addNotification(
        new NotificationEvent("info", "Saving changes"),
      );
      await this.multisService.commitChanges(
        this.subredditChanges,
        Array.from(this.changedMultis),
      );
      this.changedMultis.clear();
      this.subredditChanges.clear();
      notificationStore.addNotification(
        new NotificationEvent("success", "Saved"),
      );
    },
  },
});
