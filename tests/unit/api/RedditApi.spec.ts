import { expect } from "chai";
import { AxiosInstance, AxiosResponse } from "axios";
import sinon, { stubInterface } from "ts-sinon";
import { RedditApi } from "@/api/RedditApi";
import { MultiReddit, Subreddit } from "@/types";

describe("RedditApi.ts", () => {
  const axiosInstance = stubInterface<AxiosInstance>();
  const redditApi = new RedditApi(axiosInstance);

  afterEach(() => {
    sinon.reset();
  });

  describe("when calling getSubscribedSubreddits", function () {
    it("should call reddit only once when after is null in response", async () => {
      axiosInstance.get
        .withArgs("/subreddits/mine/subscriber", {
          params: {
            after: null,
          },
        })
        .returns(
          withAxiosResponse({
            data: {
              after: null,
              children: [
                { data: new Subreddit("d1") },
                { data: new Subreddit("d2") },
              ],
            },
          })
        );

      const actual = await redditApi.getSubscribedSubreddits();

      expect(actual)
        .length(2)
        .to.have.deep.members([new Subreddit("d1"), new Subreddit("d2")]);
    });

    function setUpChainCallsUntil(until: number) {
      for (let i = 0; i < until; i++) {
        const requestAfter = i === 0 ? null : "after" + i;
        const responseAfter = i !== until - 1 ? "after" + (i + 1) : null;
        axiosInstance.get
          .withArgs("/subreddits/mine/subscriber", {
            params: {
              after: requestAfter,
            },
          })
          .returns(
            withAxiosResponse({
              data: {
                after: responseAfter,
                children: [{ data: new Subreddit("subreddit" + i) }],
              },
            })
          );
      }
    }

    it("should call reddit multiple times until after is null in response", async () => {
      setUpChainCallsUntil(50);

      const actual = await redditApi.getSubscribedSubreddits();

      const expected = [...Array(50).keys()].map(
        (i) => new Subreddit("subreddit" + i)
      );
      expect(actual).length(50).to.have.deep.members(expected);
    });

    it("should call reddit multiple times until after is null in response or upto 100 times", async () => {
      setUpChainCallsUntil(105);

      const actual = await redditApi.getSubscribedSubreddits();

      const expected = [...Array(100).keys()].map(
        (i) => new Subreddit("subreddit" + i)
      );
      expect(actual).length(100).to.have.deep.members(expected);
    });
  });

  describe("when calling getMultiMine", function () {
    it("should call reddit and transform response", async () => {
      axiosInstance.get.withArgs("/api/multi/mine").returns(
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
        ])
      );

      const actual = await redditApi.getMultiMine();

      expect(actual).to.be.eql([
        new MultiReddit(
          "multi1",
          "path1",
          new Set<string>(["subreddits1", "subreddits2"])
        ),
        new MultiReddit(
          "multi2",
          "path2",
          new Set<string>(["subreddits1", "subreddits3"])
        ),
      ]);
    });
  });

  describe("when calling subscribeToSubreddits", function () {
    it("should delegate to reddit", async () => {
      await redditApi.subscribeToSubreddits("subreddits");

      expect(axiosInstance.post.calledOnce).to.be.true;
      expect(axiosInstance.post.getCalls()[0].args).to.be.eql([
        "/api/subscribe",
        {},
        {
          params: {
            action: "sub",
            sr_name: "subreddits",
          },
        },
      ]);
    });
  });

  describe("when calling unsubscribeToSubreddits", function () {
    it("should delegate to reddit", async () => {
      await redditApi.unsubscribeToSubreddits("subreddits");

      expect(axiosInstance.post.calledOnce).to.be.true;
      expect(axiosInstance.post.getCalls()[0].args).to.be.eql([
        "/api/subscribe",
        {},
        {
          params: {
            action: "unsub",
            sr_name: "subreddits",
          },
        },
      ]);
    });
  });

  describe("when calling updateMulti", function () {
    it("should delegate to reddit", async () => {
      await redditApi.updateMulti("/multi1", [
        { name: "subreddits1" },
        { name: "subreddits2" },
      ]);

      expect(axiosInstance.put.calledOnce).to.be.true;
      expect(axiosInstance.put.getCalls()[0].args).to.be.eql([
        "/api/multi/multi1",
        {},
        {
          params: {
            model: {
              subreddits: [{ name: "subreddits1" }, { name: "subreddits2" }],
            },
          },
        },
      ]);
    });
  });

  function withAxiosResponse<T>(t: T): Promise<AxiosResponse<T>> {
    return new Promise((resolve) => {
      const axiosResponse = stubInterface<AxiosResponse>();
      axiosResponse.data = t;
      resolve(axiosResponse);
    });
  }
});
