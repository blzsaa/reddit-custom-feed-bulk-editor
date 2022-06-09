import { expect } from "chai";
import { MultiReddit, Subreddit } from "@/types";
import sinon, { stubConstructor } from "ts-sinon";
import { RedditApi } from "@/api/RedditApi";
import { MultisService } from "@/service/MultisService";

describe("MultisService.ts", () => {
  const redditApi = stubConstructor(RedditApi);
  const multisService = new MultisService(redditApi);

  const subreddits = [
    new Subreddit("displayNameSubreddits1"),
    new Subreddit("displayNameSubreddits2"),
  ];

  const multiRedditArray = [
    new MultiReddit(
      "displayNameMultiReddit1",
      "path1",
      new Set<string>(["a", "b", "displayNameSubreddits1"])
    ),
    new MultiReddit(
      "displayNameMultiReddit2",
      "path2",
      new Set<string>(["a", "c"])
    ),
  ];

  afterEach(() => {
    sinon.reset();
  });

  describe("when calling getSubscribedSubreddits", function () {
    it("should delegate to redditApi", async function () {
      const dummyCallbackFunction = sinon.spy();

      const onfulfilled: Promise<Subreddit[]> = Promise.resolve(subreddits);
      redditApi.getSubscribedSubreddits
        .withArgs(dummyCallbackFunction)
        .returns(onfulfilled);

      const actual = await multisService.getSubscribedSubreddits(
        dummyCallbackFunction
      );

      expect(actual).to.be.eql(subreddits);
    });
  });
  describe("when calling getMultiMine", function () {
    it("should delegate to redditApi", async function () {
      const onfulfilled: Promise<MultiReddit[]> =
        Promise.resolve(multiRedditArray);
      redditApi.getMultiMine.returns(onfulfilled);

      const actual = await multisService.getMultiMine();

      expect(actual).to.be.eql(multiRedditArray);
    });
  });

  describe("when calling mapToDatatableRows", function () {
    describe("with empty inputs", function () {
      it("should transform to empty DatatableRow", function () {
        const actual = multisService.mapToDatatableRows([], []);

        expect(actual).to.be.eql([]);
      });
    });
    describe("with only subreddits filled", function () {
      it("should transform to DatatableRows where all subreddits are subscribed", function () {
        const actual = multisService.mapToDatatableRows(subreddits, []);

        expect(actual).to.be.eql([
          { name: "displayNameSubreddits1", subscribed: true },
          { name: "displayNameSubreddits2", subscribed: true },
        ]);
      });
    });
    describe("with both subreddits and multiRedditArray filled", function () {
      it("should merge the two inputs", function () {
        const actual = multisService.mapToDatatableRows(
          subreddits,
          multiRedditArray
        );

        expect(actual).to.be.eql([
          {
            name: "displayNameSubreddits1",
            subscribed: true,
            displayNameMultiReddit1: true,
            displayNameMultiReddit2: false,
          },
          {
            name: "displayNameSubreddits2",
            subscribed: true,
            displayNameMultiReddit1: false,
            displayNameMultiReddit2: false,
          },
          {
            name: "a",
            subscribed: false,
            displayNameMultiReddit1: true,
            displayNameMultiReddit2: true,
          },
          {
            name: "b",
            subscribed: false,
            displayNameMultiReddit1: true,
            displayNameMultiReddit2: false,
          },
          {
            name: "c",
            subscribed: false,
            displayNameMultiReddit1: false,
            displayNameMultiReddit2: true,
          },
        ]);
      });
    });
  });
});
