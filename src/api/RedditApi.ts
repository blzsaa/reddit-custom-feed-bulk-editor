import type { AxiosInstance } from "axios";
import { MultiReddit, Subreddit } from "@/types";

export class RedditApi {
  private instance: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this.instance = instance;
  }

  public async getSubscribedSubreddits(
    callbackFunction: (result: number) => void,
  ): Promise<Subreddit[]> {
    let after = null;
    const result: Subreddit[] = [];
    let i = 0;
    do {
      const response: {
        data: { data: { after: string; children: { data: Subreddit }[] } };
      } = await this.instance.get("/subreddits/mine/subscriber", {
        params: {
          after: after,
          limit: 100,
        },
      });
      after = response.data.data.after;
      result.push(...response.data.data.children.map((c) => c.data));
      callbackFunction(result.length);
      i++;
    } while (after !== null && i < 100);
    return result;
  }

  public async getMultiMine(): Promise<MultiReddit[]> {
    const response: {
      data: {
        data: {
          display_name: string;
          path: string;
          subreddits: { name: string }[];
        };
      }[];
    } = await this.instance.get("/api/multi/mine");

    return response.data.map(
      (d) =>
        new MultiReddit(
          d.data.display_name,
          d.data.path,
          new Set<string>(d.data.subreddits.map((a) => a.name)),
        ),
    );
  }

  public async subscribeToSubreddits(subreddits: string): Promise<void> {
    return this.instance.post(
      "/api/subscribe",
      {},
      {
        params: {
          action: "sub",
          sr_name: subreddits,
        },
      },
    );
  }

  public async unsubscribeToSubreddits(subreddits: string): Promise<void> {
    return this.instance.post(
      "/api/subscribe",
      {},
      {
        params: {
          action: "unsub",
          sr_name: subreddits,
        },
      },
    );
  }

  public async updateMulti(
    multiPath: string,
    subreddits: { name: string }[],
  ): Promise<void> {
    return this.instance.put(
      `/api/multi${multiPath}`,
      {},
      {
        params: {
          model: {
            subreddits: subreddits,
          },
        },
      },
    );
  }
}
