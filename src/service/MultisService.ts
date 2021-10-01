import { RedditApi } from "@/api/RedditApi";
import { Action, DatatableRow, MultiReddit, Subreddit } from "@/types";

export class MultisService {
  constructor(private redditApi: RedditApi) {}

  getSubscribedSubreddits(): Promise<Subreddit[]> {
    return this.redditApi.getSubscribedSubreddits();
  }

  getMultiMine(): Promise<MultiReddit[]> {
    return this.redditApi.getMultiMine();
  }

  getNameOfMultis(multis: MultiReddit[]): string[] {
    return multis.map((m) => m.display_name);
  }

  commitChanges(subredditChanges: Map<string, Action>): Promise<void[]> {
    const subredditsToSubscribe = [] as string[];
    const subredditsToUnsubscribe = [] as string[];
    subredditChanges.forEach((v, k) => {
      v === Action.Subscribe
        ? subredditsToSubscribe.push(k)
        : subredditsToUnsubscribe.push(k);
    });
    const promises = [] as Promise<void>[];
    if (subredditsToSubscribe.length !== 0) {
      const toSubscribe = subredditsToSubscribe.join(",");
      promises.push(this.redditApi.subscribeToSubreddits(toSubscribe));
    }
    if (subredditsToUnsubscribe.length !== 0) {
      const toUnsubscribe = subredditsToUnsubscribe.join(",");
      promises.push(this.redditApi.unsubscribeToSubreddits(toUnsubscribe));
    }
    return Promise.all(promises);
  }

  mapToDatatableRows(
    subreddits: Subreddit[],
    multis: MultiReddit[]
  ): DatatableRow[] {
    const subscribedSubreddits: Map<
      string,
      { name: string; subscribed: boolean }
    > = subreddits.reduce((l, w) => {
      l.set(w.display_name, { name: w.display_name, subscribed: true });
      return l;
    }, new Map());

    const subscribedAndMultireddits: Map<string, DatatableRow> = multis.reduce(
      function (map: Map<string, DatatableRow>, multi) {
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
      subscribedSubreddits
    );

    return [...subscribedAndMultireddits].map((a) => {
      return a[1];
    });
  }
}
