import { describe, it, expect } from "vitest";
import { generateFiltersForDataTable } from "@/service/DataTableCustomFilterService";
import { FilterMatchMode } from "primevue/api";
import { MultiReddit } from "@/types";

describe("DataTableCustomFilterService.ts", () => {
  describe("when calling generateFiltersForDataTable", function () {
    describe("with empty array", function () {
      it("should create contains filter for name and equals filter for subscribed", function () {
        const actual = generateFiltersForDataTable([]);

        expect(actual).to.be.eql({
          name: { value: null, matchMode: FilterMatchMode.CONTAINS },
          subscribed: {
            value: null,
            matchMode: FilterMatchMode.EQUALS,
          },
        });
      });
    });
    describe("with multireddits", function () {
      it(
        "should create contain filter for name and equals filter for subscribed " +
          "and all display names from input array",
        function () {
          const actual = generateFiltersForDataTable([
            new MultiReddit("displayName1", "path1", new Set()),
            new MultiReddit("displayName2", "path1", new Set()),
            new MultiReddit("displayName3", "path1", new Set()),
          ]);

          expect(actual).to.be.eql({
            name: { value: null, matchMode: FilterMatchMode.CONTAINS },
            displayName1: { value: null, matchMode: FilterMatchMode.EQUALS },
            displayName2: { value: null, matchMode: FilterMatchMode.EQUALS },
            displayName3: { value: null, matchMode: FilterMatchMode.EQUALS },
            subscribed: {
              value: null,
              matchMode: FilterMatchMode.EQUALS,
            },
          });
        }
      );
    });
  });
});
