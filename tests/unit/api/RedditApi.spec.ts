import { describe, it, expect, afterEach, vi } from "vitest";
import { KyInstance, ResponsePromise } from "ky";
import { RedditApi } from "@/api/RedditApi";
import { MultiReddit, Subreddit } from "@/types";
import { mock, matches } from "vitest-mock-extended";

describe("RedditApi.ts", () => {
  const httpClient = mock<KyInstance>();
  const redditApi = new RedditApi(httpClient);
  const callbackCollector: number[] = [];

  const dummyCallbackFunction = () => (a: number) => callbackCollector.push(a);

  afterEach(() => {
    vi.restoreAllMocks();
    callbackCollector.length = 0;
  });

  describe("when calling getSubscribedSubreddits", function () {
    it("should call reddit only once when after is null in response", async () => {
      httpClient.get
        .calledWith(
          "subreddits/mine/subscriber",
          matches(
            (actualValue) =>
              (actualValue.searchParams as URLSearchParams).toString() ===
              new URLSearchParams({ limit: "100" }).toString(),
          ),
        )
        .mockReturnValue(
          withKyResponse({
            data: {
              after: null,
              children: [
                { data: new Subreddit("d1") },
                { data: new Subreddit("d2") },
              ],
            },
          }),
        );

      const actual = await redditApi.getSubscribedSubreddits(
        dummyCallbackFunction(),
      );

      expect(actual)
        .length(2)
        .to.have.deep.members([new Subreddit("d1"), new Subreddit("d2")]);
      expect(callbackCollector).to.have.members([2]);
    });

    function setUpChainCallsUntil(until: number) {
      for (let i = 0; i < until; i++) {
        const requestAfter = i === 0 ? null : "after" + i;
        const responseAfter = i !== until - 1 ? "after" + (i + 1) : null;
        httpClient.get
          .calledWith(
            "subreddits/mine/subscriber",
            matches((actualValue) => {
              const expectedSearchParams = new URLSearchParams({
                limit: "100",
              });
              if (requestAfter) {
                expectedSearchParams.append("after", requestAfter);
              }
              return (
                (actualValue.searchParams as URLSearchParams).toString() ===
                expectedSearchParams.toString()
              );
            }),
          )
          .mockReturnValue(
            withKyResponse({
              data: {
                after: responseAfter,
                children: [{ data: new Subreddit("subreddit" + i) }],
              },
            }),
          );
      }
    }

    it("should call reddit multiple times until after is null in response", async () => {
      setUpChainCallsUntil(50);

      const actual = await redditApi.getSubscribedSubreddits(
        dummyCallbackFunction(),
      );

      const expected = [...Array(50).keys()].map(
        (i) => new Subreddit("subreddit" + i),
      );
      expect(actual).length(50).to.have.deep.members(expected);
      expect(callbackCollector).to.have.members(
        [...Array(50).keys()].map((i) => i + 1),
      );
    });

    it("should call reddit multiple times until after is null in response or upto 100 times", async () => {
      setUpChainCallsUntil(105);

      const actual = await redditApi.getSubscribedSubreddits(
        dummyCallbackFunction(),
      );

      const expected = [...Array(100).keys()].map(
        (i) => new Subreddit("subreddit" + i),
      );
      expect(actual).length(100).to.have.deep.members(expected);
      expect(callbackCollector).to.have.members(
        [...Array(100).keys()].map((i) => i + 1),
      );
    });
  });

  describe("when calling getMultiMine", function () {
    it("should call reddit and transform response", async () => {
      httpClient.get.calledWith("api/multi/mine").mockReturnValue(
        withKyResponse([
          {
            data: {
              display_name: "multi1",
              path: "path1",
              subreddits: [
                { name: "subreddits1" },
                { name: "subreddits2" },
                { name: "subreddits2" },
              ],
            },
          },
          {
            data: {
              display_name: "multi2",
              path: "path2",
              subreddits: [{ name: "subreddits1" }, { name: "subreddits3" }],
            },
          },
        ]),
      );

      const actual = await redditApi.getMultiMine();

      expect(actual).to.be.eql([
        new MultiReddit(
          "multi1",
          "path1",
          new Set<string>(["subreddits1", "subreddits2"]),
        ),
        new MultiReddit(
          "multi2",
          "path2",
          new Set<string>(["subreddits1", "subreddits3"]),
        ),
      ]);
    });
  });

  describe("when calling subscribeToSubreddits", function () {
    it("should delegate to reddit", async () => {
      httpClient.post.mockReturnValue(withKyResponse({}));

      await redditApi.subscribeToSubreddits("subreddits");

      expect(httpClient.post).toHaveBeenCalledOnce();
      expect(httpClient.post).toBeCalledWith("api/subscribe", {
        searchParams: new URLSearchParams({
          action: "sub",
          sr_name: "subreddits",
        }),
      });
    });
  });

  describe("when calling unsubscribeToSubreddits", function () {
    it("should delegate to reddit", async () => {
      httpClient.post.mockReturnValue(withKyResponse({}));

      await redditApi.unsubscribeToSubreddits("subreddits");

      expect(httpClient.post).toHaveBeenCalledOnce();
      expect(httpClient.post).toBeCalledWith("api/subscribe", {
        searchParams: new URLSearchParams({
          action: "unsub",
          sr_name: "subreddits",
        }),
      });
    });
  });

  describe("when calling updateMulti", function () {
    it("should delegate to reddit", async () => {
      httpClient.put.mockReturnValue(withKyResponse({}));

      await redditApi.updateMulti("/multi1", [
        { name: "subreddits1" },
        { name: "subreddits2" },
      ]);

      expect(httpClient.put).toHaveBeenCalledOnce();
      expect(httpClient.put).toBeCalledWith("api/multi/multi1", {
        searchParams: new URLSearchParams({
          model: JSON.stringify({
            subreddits: [{ name: "subreddits1" }, { name: "subreddits2" }],
          }),
        }),
      });
    });
  });

  describe("when calling findSubredditsByPrefix", function () {
    it("should delegate to reddit and return with a list of displayNames only", async () => {
      const response = {
        data: {
          children: [
            { data: { display_name: "subreddit1" } },
            { data: { display_name: "subreddit2" } },
            { data: { display_name: "subreddit3" } },
          ],
        },
      };
      httpClient.get.mockReturnValue(withKyResponse(response));

      const actual = await redditApi.findSubredditsByPrefix("prefix");

      expect(actual).to.be.deep.equals([
        "subreddit1",
        "subreddit2",
        "subreddit3",
      ]);
      expect(httpClient.get).toHaveBeenCalledOnce();
      expect(httpClient.get).toBeCalledWith("api/subreddit_autocomplete_v2", {
        searchParams: {
          query: "prefix",
          include_over_18: true,
          include_profiles: false,
          limit: 10,
          typeahead_active: true,
        },
      });
    });
  });

  function withKyResponse<T>(t: T) {
    const responsePromise = mock<ResponsePromise>();
    responsePromise.json.mockReturnValue(Promise.resolve(t));
    return responsePromise;
  }
});
