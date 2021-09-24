import { defineStore } from "pinia";
import { RedditApi } from "@/api/RedditApi";
import { FilterMatchMode } from "primevue/api";
import { DataTableFilter } from "@/types";

export const useMultiFeedStore = defineStore("multi-feed", {
  state: () => ({
    accessToken: undefined as string | undefined,
    headers: [] as string[],
    dataTableContent: [] as { name: string }[],
    filters: {
      name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    } as DataTableFilter,
  }),
  actions: {
    extractAccessToken(location: Location) {
      const hash = location.hash.substr(1);
      const result: Map<string, string> = hash
        .split("&")
        .reduce(function (res, item) {
          const parts = item.split("=");
          res.set(parts[0], parts[1]);
          return res;
        }, new Map<string, string>());
      this.accessToken = result.get("access_token");
    },
    async readMultiFeedInformationFromReddit() {
      if (this.accessToken === undefined) {
        throw { error: "accessToken is missing" };
      }
      const redditApi = new RedditApi(this.accessToken);
      const [subreddits, multis] = await Promise.all([
        redditApi.getSubscribedSubreddits(),
        redditApi.getMultiMine(),
      ]);

      const subscribedSubreddits: Map<
        string,
        { name: string; subscribed: boolean }
      > = subreddits.reduce((l, w) => {
        l.set(w.display_name, { name: w.display_name, subscribed: true });
        return l;
      }, new Map());

      const subscribedAndMultireddits: Map<
        string,
        { name: string; subscribed: boolean; [key: string]: boolean | string }
      > = multis.reduce(function (
        map: Map<
          string,
          { name: string; subscribed: boolean; [key: string]: boolean | string }
        >,
        multi
      ) {
        for (const subreddit of multi.subreddits) {
          const obj = map.get(subreddit);
          if (obj !== undefined) {
            obj[multi.display_name] = true;
          } else {
            map.set(subreddit, {
              name: subreddit,
              subscribed: false,
              [multi.display_name]: true,
            });
          }
        }
        return map;
      },
      subscribedSubreddits);

      this.dataTableContent = [...subscribedAndMultireddits].map((a) => {
        return a[1];
      });

      this.headers = ["name", "subscribed"].concat(
        multis.map((m) => m.display_name)
      );

      this.filters = this.headers
        .filter((a) => a !== "name")
        .reduce(
          (filterObject, a) => {
            filterObject[a] = {
              value: null,
              matchMode: "filterEitherTrueOrNullValues",
            };
            return filterObject;
          },
          {
            name: { value: null, matchMode: FilterMatchMode.CONTAINS },
          } as DataTableFilter
        );
    },
  },
});
