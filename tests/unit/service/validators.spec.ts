import { expect } from "chai";
import sinon, { stubConstructor } from "ts-sinon";
import { MultisService } from "@/service/MultisService";
import {
  mustBeAnExistingSubreddit,
  mustBeNotAlreadyInDataTable,
} from "@/service/validators";

describe("validators.ts", () => {
  describe("mustBeAnExistingSubreddit", () => {
    const multisService = stubConstructor(MultisService);

    afterEach(() => {
      sinon.reset();
    });

    it("should be valid when input is falsy", async () => {
      const actual = await mustBeAnExistingSubreddit("", multisService);

      expect(actual).to.be.eql(true);
    });
    it("should be invalid when searchSubreddit returns empty for the input", async () => {
      multisService.searchSubreddit
        .withArgs("asd")
        .returns(Promise.resolve([]));

      const actual = await mustBeAnExistingSubreddit("asd", multisService);

      expect(actual).to.be.eql(false);
    });
    it("should be invalid when searchSubreddit does not return the input", async () => {
      multisService.searchSubreddit
        .withArgs("asd")
        .returns(Promise.resolve(["not-asd1", "not-asd2"]));

      const actual = await mustBeAnExistingSubreddit("asd", multisService);

      expect(actual).to.be.eql(false);
    });
    it("should be valid when searchSubreddit returns exactly the input", async () => {
      multisService.searchSubreddit
        .withArgs("asd")
        .returns(Promise.resolve(["asd"]));

      const actual = await mustBeAnExistingSubreddit("asd", multisService);

      expect(actual).to.be.eql(true);
    });
    it("should be valid when searchSubreddit returns value equal to input in ignore case", async () => {
      multisService.searchSubreddit
        .withArgs("asd")
        .returns(Promise.resolve(["AsD"]));

      const actual = await mustBeAnExistingSubreddit("asd", multisService);

      expect(actual).to.be.eql(true);
    });
    it("should be valid when searchSubreddit returns multiple result including the input", async () => {
      multisService.searchSubreddit
        .withArgs("asd")
        .returns(Promise.resolve(["not-asd1", "not-asd2", "asd"]));

      const actual = await mustBeAnExistingSubreddit("asd", multisService);

      expect(actual).to.be.eql(true);
    });
  });
  describe("mustBeNotAlreadyInDataTable", () => {
    it("should be valid when input is falsy", () => {
      const actual = mustBeNotAlreadyInDataTable("", []);

      expect(actual).to.be.eql(true);
    });
    it("should be valid when datatable is empty", () => {
      const actual = mustBeNotAlreadyInDataTable("asd", []);

      expect(actual).to.be.eql(true);
    });
    it("should be valid when datatable does not contains the input", () => {
      const actual = mustBeNotAlreadyInDataTable(
        "asd",
        multis("not-asd1", "not-asd2")
      );

      expect(actual).to.be.eql(true);
    });
    it("should be invalid when datatable contains the input", async () => {
      const actual = mustBeNotAlreadyInDataTable(
        "asd",
        multis("not-asd1", "not-asd2", "asd")
      );

      expect(actual).to.be.eql(false);
    });
    it("should be invalid when datatable contains a value that equals ignore case input ", async () => {
      const actual = mustBeNotAlreadyInDataTable(
        "asd",
        multis("not-asd1", "not-asd2", "aSD")
      );

      expect(actual).to.be.eql(false);
    });

    function multis(...names: string[]) {
      return names.map((name) => ({ name, subscribed: true }));
    }
  });
});
