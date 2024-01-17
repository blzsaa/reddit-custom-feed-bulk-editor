import { MultiReddit, Subreddit } from "@/types";
import type { KyInstance } from "ky";

export class RedditApi {
  private instance: KyInstance;

  constructor(instance: KyInstance) {
    this.instance = instance;
  }

  public async getSubscribedSubreddits(
    callbackFunction: (result: number) => void,
  ): Promise<Subreddit[]> {
    let after = null;
    const result: Subreddit[] = [];
    let i = 0;
    do {
      const searchParams = new URLSearchParams({ limit: "100" });
      if (after) {
        searchParams.append("after", after);
      }

      const response: {
        data: { after: string; children: { data: Subreddit }[] };
      } = await this.instance
        .get("subreddits/mine/subscriber", { searchParams: searchParams })
        .json();
      after = response.data.after;
      result.push(...response.data.children.map((c) => c.data));
      callbackFunction(result.length);
      i++;
    } while (after !== null && i < 100);
    return result;
  }

  public async getMultiMine(): Promise<MultiReddit[]> {
    const response: {
      data: {
        display_name: string;
        path: string;
        subreddits: { name: string }[];
      };
    }[] = await this.instance.get("api/multi/mine").json();

    console.log(response);
    return response.map(
      (d) =>
        new MultiReddit(
          d.data.display_name,
          d.data.path,
          new Set<string>(d.data.subreddits.map((a) => a.name)),
        ),
    );
  }

  public async subscribeToSubreddits(subreddits: string): Promise<void> {
    return this.instance
      .post("api/subscribe", {
        searchParams: new URLSearchParams({
          action: "sub",
          sr_name: subreddits,
        }),
      })
      .json();
  }

  public async unsubscribeToSubreddits(subreddits: string): Promise<void> {
    const searchParams = new URLSearchParams({
      action: "unsub",
      sr_name: subreddits,
    });
    return this.instance
      .post("api/subscribe", { searchParams: searchParams })
      .json();
  }

  public async updateMulti(
    multiPath: string,
    subreddits: { name: string }[],
  ): Promise<void> {
    const searchParams = new URLSearchParams({
      model: JSON.stringify({
        subreddits: subreddits,
      }),
    });
    return this.instance
      .put(`api/multi${multiPath}`, { searchParams: searchParams })
      .json();
  }
}
