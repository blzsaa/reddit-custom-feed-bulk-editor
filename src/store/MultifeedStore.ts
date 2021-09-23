import { defineStore } from "pinia";
import { RedditApi } from "@/api/RedditApi";

export const useMultiFeedStore = defineStore("multi-feed", {
  state: () => ({
    accessToken: undefined as string | undefined,
    headers: [] as string[],
    dataTableContent: [] as { name: string }[],
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

      const subscribedSubreddits: Map<string, { name: string }> =
        subreddits.reduce((l, w) => {
          l.set(w.display_name, { name: w.display_name, subscribed: true });
          return l;
        }, new Map());

      const subscribedAndMultireddits: Map<string, { name: string }> =
        multis.reduce(function (map: Map<string, any>, multi) {
          for (const subreddit of multi.subreddits) {
            if (map.get(subreddit)) {
              map.get(subreddit)[multi.display_name] = true;
            } else {
              map.set(subreddit, {
                name: subreddit,
                [multi.display_name]: true,
              });
            }
          }
          return map;
        }, subscribedSubreddits);

      this.dataTableContent = [...subscribedAndMultireddits].map((a) => {
        return a[1];
      });

      this.headers = ["name", "subscribed"].concat(
        multis.map((m) => m.display_name)
      );
    },
  },
});
