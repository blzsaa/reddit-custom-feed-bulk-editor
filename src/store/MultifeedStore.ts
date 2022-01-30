import { defineStore } from "pinia";
import {
  Action,
  DataTableFilter,
  DatatableRow,
  LoadingStatsCallback,
  MultiReddit,
  Subreddit,
} from "@/types";
import { MultisService } from "@/service/MultisService";
import { AccessTokenFactory } from "@/service/AccessTokenFactory";
import { generateFiltersForDataTable } from "@/service/DataTableCustomFilterService";
import axios from "axios";
import { RedditApi } from "@/api/RedditApi";

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
    filters: {} as DataTableFilter,
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
      this.multisService = new MultisService(new RedditApi(axiosInstance));
    },
    async readMultiFeedInformationFromReddit(
      callbackFunction: (stats: LoadingStatsCallback) => void
    ) {
      const [subreddits, multis] = await Promise.all([
        this.multisService
          .getSubscribedSubreddits((n) =>
            callbackFunction({
              kind: "LoadedSubreddits",
              loadedSubreddits: n,
            })
          )
          .then((m) => {
            callbackFunction({ kind: "LoadedAllSubreddits" });
            return m;
          }),
        this.multisService.getMultiMine().then((m) => {
          callbackFunction({ kind: "LoadedMultis", loadedMultis: m.length });
          return m;
        }),
      ]);
      callbackFunction({ kind: "processingData" });
      this.subreddits = subreddits;
      this.multis = multis;
      this.nameOfMultis = this.multisService.getNameOfMultis(this.multis);
      this.filters = generateFiltersForDataTable(multis);
      this.dataTableContent = this.multisService.mapToDatatableRows(
        this.subreddits,
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
      await this.multisService.commitChanges(
        this.subredditChanges,
        Array.from(this.changedMultis)
      );
      this.changedMultis.clear();
      this.subredditChanges.clear();
    },
  },
});
