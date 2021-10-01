import { defineStore } from "pinia";
import {
  Action,
  DataTableFilter,
  DatatableRow,
  MultiReddit,
  Subreddit,
} from "@/types";
import { MultisService } from "@/service/MultisService";
import { MultisServiceFactory } from "@/service/MultisServiceFactory";
import { generateFiltersForDataTable } from "@/service/DataTableCustomFilterService";

export const useMultiFeedStore = defineStore("multi-feed", {
  state: () => ({
    nameOfMultis: [] as string[],
    dataTableContent: [] as DatatableRow[],
    subredditChanges: new Map<string, Action>(),
    subreddits: [] as Subreddit[],
    multis: [] as MultiReddit[],
    multisService: {} as MultisService,
    filters: {} as DataTableFilter,
  }),
  actions: {
    extractAccessToken(location: Location) {
      this.multisService = new MultisServiceFactory().extractAccessToken(
        location
      );
    },
    async readMultiFeedInformationFromReddit() {
      const [subreddits, multis] = await Promise.all([
        this.multisService.getSubscribedSubreddits(),
        this.multisService.getMultiMine(),
      ]);
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
    async commitChanges() {
      await this.multisService.commitChanges(this.subredditChanges);
      this.subredditChanges.clear();
    },
  },
});
