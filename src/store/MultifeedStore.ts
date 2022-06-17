import { defineStore } from "pinia";
import {
  Action,
  DataTableFilter,
  DatatableRow,
  LoadingStatsCallback,
  MultiReddit,
  NotificationEvent,
} from "@/types";
import { MultisService } from "@/service/MultisService";
import { AccessTokenFactory } from "@/service/AccessTokenFactory";
import { generateFiltersForDataTable } from "@/service/DataTableCustomFilterService";
import axios from "axios";
import { RedditApi } from "@/api/RedditApi";
import router from "@/router";
import { useNotificationStore } from "@/store/NotificationStore";
import { markRaw } from "vue";

export const useMultiFeedStore = defineStore("multi-feed", {
  state: () => ({
    accessToken: "" as string,
    dataTableContent: [] as DatatableRow[],
    subredditChanges: new Map<string, Action>(),
    multis: [] as MultiReddit[],
    changedMultis: new Set<MultiReddit>(),
    multisService: {} as MultisService,
    filters: {} as DataTableFilter,
    router: markRaw(router),
  }),
  persist: {
    paths: ["accessToken"],
  },
  actions: {
    async extractAccessToken(href: string) {
      this.accessToken = await new AccessTokenFactory().extractAccessToken(
        axios.create({ baseURL: process.env.VUE_APP_REDDIT_URL }),
        href
      );
    },
    async initService() {
      const axiosInstance = axios.create({
        baseURL: process.env.VUE_APP_OAUTH_REDDIT_URL,
        timeout: 5000,
        headers: {
          Authorization: "bearer " + this.accessToken,
        },
      });
      axiosInstance.interceptors.response.use(
        (response) => response,
        (error) => {
          const notificationStore = useNotificationStore();
          if (error.response.status === 401) {
            this.accessToken = "";
            notificationStore.addNotification(
              new NotificationEvent("error", "Timeout", "Please reauthenticate")
            );
            router.push({ path: "/" });
          }
          return Promise.reject(error);
        }
      );

      this.multisService = new MultisService(new RedditApi(axiosInstance));
    },
    async readMultiFeedInformationFromReddit(
      callbackFunction: (stats: LoadingStatsCallback) => void
    ) {
      const subreddits = await this.multisService
        .getSubscribedSubreddits((n) =>
          callbackFunction({
            kind: "LoadedSubreddits",
            loadedSubreddits: n,
          })
        )
        .then((m) => {
          callbackFunction({ kind: "LoadedAllSubreddits" });
          return m;
        });
      this.multis = await this.multisService.getMultiMine().then((m) => {
        callbackFunction({ kind: "LoadedMultis", loadedMultis: m.length });
        return m;
      });
      callbackFunction({ kind: "processingData" });
      this.filters = generateFiltersForDataTable(this.multis);
      this.dataTableContent = this.multisService.mapToDatatableRows(
        subreddits,
        this.multis
      );
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
      newStatus: boolean
    ) {
      this.multis
        .filter((a) => a.display_name == nameOfTheMulti)
        .forEach((find) => {
          this.changedMultis.add(find);
          if (newStatus) {
            find.subreddits.add(nameOfTheSubreddit);
          } else {
            find.subreddits.delete(nameOfTheSubreddit);
          }
        });
    },
    async commitChanges() {
      const notificationStore = useNotificationStore();
      notificationStore.addNotification(
        new NotificationEvent("info", "Saving changes")
      );
      await this.multisService.commitChanges(
        this.subredditChanges,
        Array.from(this.changedMultis)
      );
      this.changedMultis.clear();
      this.subredditChanges.clear();
      notificationStore.addNotification(
        new NotificationEvent("success", "Saved")
      );
    },
  },
});
