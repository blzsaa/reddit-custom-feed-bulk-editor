import { RedditApi } from "@/api/RedditApi";
import { Action, DatatableRow, MultiReddit, Subreddit } from "@/types";

export class MultisService {
  constructor(private redditApi: RedditApi) {}

  getSubscribedSubreddits(
    callbackFunction: (result: number) => void
  ): Promise<Subreddit[]> {
    return this.redditApi.getSubscribedSubreddits(callbackFunction);
  }

  getMultiMine(): Promise<MultiReddit[]> {
    return this.redditApi.getMultiMine();
  }

  commitChanges(
    subredditChanges: Map<string, Action>,
    customFeedWithChanges: MultiReddit[]
  ): Promise<void[]> {
    const subredditsToSubscribe = [] as string[];
    const subredditsToUnsubscribe = [] as string[];
    subredditChanges.forEach((v, k) => {
      v === Action.Subscribe
        ? subredditsToSubscribe.push(k)
        : subredditsToUnsubscribe.push(k);
    });
    const promises: Promise<void>[] = customFeedWithChanges.map((m) =>
      this.redditApi.updateMulti(
        m.path,
        Array.from(m.subreddits).map((s) => ({ name: s }))
      )
    );
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
    const dummyDataTableRow = { name: "", subscribed: false } as DatatableRow;
    multis.forEach((m) => (dummyDataTableRow[m.display_name] = false));

    const subscribedSubreddits: Map<
      string,
      { name: string; subscribed: boolean }
    > = subreddits.reduce((l, w) => {
      l.set(w.display_name, {
        ...dummyDataTableRow,
        ...{ name: w.display_name, subscribed: true },
      });
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
              ...dummyDataTableRow,
              ...{
                name: subreddit,
                subscribed: false,
                [multi.display_name]: true,
              },
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

  public async searchSubreddit(subredditPrefix: string): Promise<string[]> {
    return this.redditApi.searchSubreddit(subredditPrefix);
  }
}
