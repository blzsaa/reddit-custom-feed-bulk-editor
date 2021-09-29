import axios, { AxiosInstance } from "axios";
import { MultiReddit, Subreddit } from "@/types";

export class RedditApi {
  private instance: AxiosInstance;

  constructor(token: string) {
    this.instance = axios.create({
      baseURL: "https://oauth.reddit.com",
      timeout: 5000,
      headers: {
        Authorization: "bearer " + token,
      },
    });
  }

  public async getSubscribedSubreddits(): Promise<Subreddit[]> {
    let after = null;
    let result: Subreddit[] = [];
    let i = 0;
    do {
      const response: {
        data: { data: { after: string; children: { data: Subreddit }[] } };
      } = await this.instance.get("/subreddits/mine/subscriber", {
        params: {
          after: after,
        },
      });
      after = response.data.data.after;
      result = result.concat(response.data.data.children.map((c) => c.data));
      i++;
    } while (after !== null && i < 100);
    return result;
  }

  public async getMultiMine(): Promise<MultiReddit[]> {
    const response: {
      data: {
        data: { display_name: string; subreddits: { name: string }[] };
      }[];
    } = await this.instance.get("/api/multi/mine");

    return response.data.map(
      (d) =>
        new MultiReddit(
          d.data.display_name,
          d.data.subreddits.map((a) => a.name)
        )
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
      }
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
      }
    );
  }
}
