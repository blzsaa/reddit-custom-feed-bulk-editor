import { createPinia, setActivePinia } from "pinia";
import { useMultiFeedStore } from "@/store/MultifeedStore";
import { expect } from "chai";
import { Action, MultiReddit, Subreddit } from "@/types";
import { MultisService } from "@/service/MultisService";
import { stubConstructor } from "ts-sinon";

describe("MultiFeed Store", () => {
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

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("after creating the store all values", function () {
    it("should ba at their default values", () => {
      const store = useMultiFeedStore();
      expect(store.nameOfMultis).to.be.empty;
      expect(store.dataTableContent).to.be.empty;
      expect(store.subredditChanges).to.be.eql(new Map<string, Action>());
      expect(store.subreddits).to.be.empty;
      expect(store.multis).to.be.empty;
      expect(store.changedMultis).to.be.eql(new Set<MultiReddit>());
      expect(store.multisService).to.be.eql({});
      expect(store.filters).to.be.eql({});
    });
  });

  describe("calling readMultiFeedInformationFromReddit", function () {
    it("should delegate all logic to the service", async () => {
      const store = useMultiFeedStore();
      const multiService = stubConstructor(MultisService);
      store.multisService = multiService;
      multiService.getSubscribedSubreddits.returns(Promise.resolve(subreddits));
      multiService.getMultiMine.returns(Promise.resolve(multiRedditArray));
      multiService.getNameOfMultis.returns([
        "displayNameMultiReddit1",
        "displayNameMultiReddit2",
      ]);
      multiService.mapToDatatableRows.returns([
        { name: "row1", subscribed: true },
      ]);

      await store.readMultiFeedInformationFromReddit();

      expect(store.nameOfMultis).to.be.eql([
        "displayNameMultiReddit1",
        "displayNameMultiReddit2",
      ]);
      expect(store.dataTableContent).to.be.eql([
        { name: "row1", subscribed: true },
      ]);
      expect(store.subredditChanges).to.be.eql(new Map<string, Action>());
      expect(store.subreddits).to.be.eql(subreddits);
      expect(store.multis).to.be.eql(multiRedditArray);
      expect(store.changedMultis).to.be.eql(new Set<MultiReddit>());
      expect(store.filters).to.be.eql({
        displayNameMultiReddit1: {
          matchMode: "equals",
          value: null,
        },
        displayNameMultiReddit2: {
          matchMode: "equals",
          value: null,
        },
        name: {
          matchMode: "contains",
          value: null,
        },
        subscribed: {
          matchMode: "equals",
          value: null,
        },
      });
    });
  });

  describe("calling changeSubscriptionStatus", function () {
    describe("when store is empty", function () {
      it("should add subscribed item to store", async () => {
        const store = useMultiFeedStore();

        store.changeSubscriptionStatus("original", true);
        expect([...store.subredditChanges]).to.be.eql([
          ["original", Action.Subscribe],
        ]);
      });
      it("should add unsubscribed item to store", async () => {
        const store = useMultiFeedStore();

        store.changeSubscriptionStatus("original", false);
        expect([...store.subredditChanges]).to.be.eql([
          ["original", Action.Unsubscribe],
        ]);
      });
    });
    describe("when store is already has an item 'original': subscribed", function () {
      it("should update 'original' to unsubscribe when its status is changed", async () => {
        const store = useMultiFeedStore();
        store.changeSubscriptionStatus("original", true);

        store.changeSubscriptionStatus("original", false);
        expect([...store.subredditChanges]).to.be.eql([
          ["original", Action.Unsubscribe],
        ]);
      });
      it("should add other elements next to 'original'", async () => {
        const store = useMultiFeedStore();
        store.changeSubscriptionStatus("original", true);

        store.changeSubscriptionStatus("b", true);
        store.changeSubscriptionStatus("c", false);

        expect([...store.subredditChanges]).to.be.eql([
          ["original", Action.Subscribe],
          ["b", Action.Subscribe],
          ["c", Action.Unsubscribe],
        ]);
      });
    });
  });

  describe("calling changeCustomFeedStatus", function () {
    it("should have no effect when store is empty", async () => {
      const store = useMultiFeedStore();

      store.changeCustomFeedStatus("multi1", "subreddit1", true);
      expect(store.multis).to.be.empty;
      expect(store.changedMultis).to.be.empty;
    });
    it("should have no effect when there is no multi with that name", async () => {
      const store = useMultiFeedStore();
      store.multis = [
        new MultiReddit(
          "differentMulti",
          "path",
          new Set<string>(["subreddit1"])
        ),
      ];

      store.changeCustomFeedStatus("multi1", "subreddit1", true);
      expect(store.multis).to.be.eql([
        new MultiReddit(
          "differentMulti",
          "path",
          new Set<string>(["subreddit1"])
        ),
      ]);
      expect(store.changedMultis).to.be.empty;
    });
    it("should add subreddit to multi when added", async () => {
      const store = useMultiFeedStore();
      store.multis = [
        new MultiReddit(
          "multi1",
          "path",
          new Set<string>(["differentSubreddit"])
        ),
        new MultiReddit(
          "differentMulti",
          "path",
          new Set<string>(["subreddit1"])
        ),
      ];

      store.changeCustomFeedStatus("multi1", "subreddit1", true);

      expect(store.multis).to.be.eql([
        new MultiReddit(
          "multi1",
          "path",
          new Set<string>(["differentSubreddit", "subreddit1"])
        ),
        new MultiReddit(
          "differentMulti",
          "path",
          new Set<string>(["subreddit1"])
        ),
      ]);
      expect([...store.changedMultis]).to.be.eql([
        new MultiReddit(
          "multi1",
          "path",
          new Set<string>(["differentSubreddit", "subreddit1"])
        ),
      ]);
    });
    it("should be able to remove subreddit from multi", async () => {
      const store = useMultiFeedStore();
      store.multis = [
        new MultiReddit(
          "multi1",
          "path",
          new Set<string>(["subreddit1", "differentSubreddit"])
        ),
        new MultiReddit(
          "differentMulti",
          "path",
          new Set<string>(["subreddit1"])
        ),
      ];

      store.changeCustomFeedStatus("multi1", "subreddit1", false);

      expect(store.multis).to.be.eql([
        new MultiReddit(
          "multi1",
          "path",
          new Set<string>(["differentSubreddit"])
        ),
        new MultiReddit(
          "differentMulti",
          "path",
          new Set<string>(["subreddit1"])
        ),
      ]);
      expect([...store.changedMultis]).to.be.eql([
        new MultiReddit(
          "multi1",
          "path",
          new Set<string>(["differentSubreddit"])
        ),
      ]);
    });
  });
  describe("calling commitChanges", function () {
    it("should delegate and clear changedMultis and subredditsChange", async () => {
      const store = useMultiFeedStore();
      const multiService = stubConstructor(MultisService);
      store.multisService = multiService;
      const changedMultis = [
        new MultiReddit("multi", "path", new Set<string>(["subreddit1"])),
      ];
      const subredditChanges = new Map([
        ["subreddit1", Action.Subscribe],
        ["subreddit2", Action.Unsubscribe],
      ]);
      store.changedMultis = new Set(changedMultis);
      store.subredditChanges = subredditChanges;

      await store.commitChanges();

      expect(multiService.commitChanges.calledOnce).to.be.true;
      expect(store.changedMultis).to.be.empty;
      expect(store.subredditChanges).to.be.empty;
    });
  });
});
