import { describe, it, expect } from "vitest";
import { mock } from "vitest-mock-extended";
import { MultisService } from "@/service/MultisService";
import { validateSubredditName } from "@/service/SubredditNameValidator";
import type { DatatableRow } from "@/types";

describe("SubredditNameValidator", () => {
  describe("validateSubredditName", function () {
    describe("when validating undefined subredditName ", function () {
      it(`should return with 'Subreddit name cannot be empty' message`, async () => {
        const actual = await validateSubredditName(undefined);

        expect(actual).to.be.eql("Subreddit name cannot be empty");
      });
    });
    describe("when validating a subredditName which is already added", function () {
      it(`should return with 'Subreddit is already added' message`, async () => {
        const datatableRows: DatatableRow[] = [
          { name: "different-subreddit1", subscribed: true },
          { name: "different-subreddit2", subscribed: true },
          { name: "subredditName", subscribed: true },
          { name: "different-subreddit4", subscribed: true },
        ];

        const actual = await validateSubredditName(
          "subredditName",
          datatableRows,
        );

        expect(actual).to.be.eql("Subreddit is already added");
      });
    });
    describe("when validating a subredditName which does not exist", function () {
      it(`should return with 'Subreddit with this name does not exist' message`, async () => {
        const datatableRows: DatatableRow[] = [
          { name: "different-subreddit1", subscribed: true },
          { name: "different-subreddit2", subscribed: true },
          { name: "different-subreddit3", subscribed: true },
        ];
        const service = mock(MultisService);
        service.findSubredditsByPrefix
          .calledWith("subredditname")
          .mockResolvedValue(["other1", "other2", "other3"]);

        const actual = await validateSubredditName(
          "subredditName",
          datatableRows,
          service,
        );

        expect(actual).to.be.eql("Subreddit with this name does not exist");
      });
    });
    describe("when validating a subredditName which exist and not yet added", function () {
      it(`should return undefined as there is no validation problem`, async () => {
        const datatableRows: DatatableRow[] = [
          { name: "different-subreddit1", subscribed: true },
          { name: "different-subreddit2", subscribed: true },
          { name: "different-subreddit3", subscribed: true },
        ];
        const service = mock(MultisService);
        service.findSubredditsByPrefix
          .calledWith("subredditname")
          .mockResolvedValue(["other1", "other2", "SUBREDDITname", "other3"]);

        const actual = await validateSubredditName(
          "subredditName",
          datatableRows,
          service,
        );

        expect(actual).to.be.undefined;
      });
    });
  });
});
