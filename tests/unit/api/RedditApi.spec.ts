import { describe, it, expect, afterEach, vi } from "vitest";
import { AxiosInstance, AxiosResponse } from "axios";
import { RedditApi } from "@/api/RedditApi";
import { MultiReddit, Subreddit } from "@/types";
import { mock, Matcher } from "vitest-mock-extended";

describe("RedditApi.ts", () => {
  const axiosInstance = mock<AxiosInstance>();
  const redditApi = new RedditApi(axiosInstance);
  const callbackCollector: number[] = [];

  const dummyCallbackFunction = () => (a: number) => callbackCollector.push(a);

  afterEach(() => {
    vi.restoreAllMocks();
    callbackCollector.length = 0;
  });

  describe("when calling getSubscribedSubreddits", function () {
    it("should call reddit only once when after is null in response", async () => {
      axiosInstance.get
        .calledWith(
          "/subreddits/mine/subscriber",
          new Matcher(
            (actualValue) =>
              null === actualValue?.params.after &&
              100 === actualValue?.params.limit,
            "matcher",
          ),
        )
        .mockReturnValue(
          withAxiosResponse({
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
        axiosInstance.get
          .calledWith(
            "/subreddits/mine/subscriber",
            new Matcher(
              (actualValue) =>
                requestAfter === actualValue?.params.after &&
                100 === actualValue?.params.limit,
              "matcher",
            ),
          )
          .mockReturnValue(
            withAxiosResponse({
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
      axiosInstance.get.calledWith("/api/multi/mine").mockReturnValue(
        withAxiosResponse([
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
      await redditApi.subscribeToSubreddits("subreddits");

      expect(axiosInstance.post).toHaveBeenCalledOnce();
      expect(axiosInstance.post).toBeCalledWith(
        "/api/subscribe",
        {},
        {
          params: {
            action: "sub",
            sr_name: "subreddits",
          },
        },
      );
    });
  });

  describe("when calling unsubscribeToSubreddits", function () {
    it("should delegate to reddit", async () => {
      await redditApi.unsubscribeToSubreddits("subreddits");

      expect(axiosInstance.post).toHaveBeenCalledOnce();
      expect(axiosInstance.post).toBeCalledWith(
        "/api/subscribe",
        {},
        {
          params: {
            action: "unsub",
            sr_name: "subreddits",
          },
        },
      );
    });
  });

  describe("when calling updateMulti", function () {
    it("should delegate to reddit", async () => {
      await redditApi.updateMulti("/multi1", [
        { name: "subreddits1" },
        { name: "subreddits2" },
      ]);

      expect(axiosInstance.put).toHaveBeenCalledOnce();
      expect(axiosInstance.put).toBeCalledWith(
        "/api/multi/multi1",
        {},
        {
          params: {
            model: {
              subreddits: [{ name: "subreddits1" }, { name: "subreddits2" }],
            },
          },
        },
      );
    });
  });

  function withAxiosResponse<T>(t: T): Promise<AxiosResponse<T>> {
    return new Promise((resolve) => {
      const axiosResponse = mock<AxiosResponse>();
      axiosResponse.data = t;
      resolve(axiosResponse);
    });
  }
});
