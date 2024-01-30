import { describe, beforeEach, it, expect } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useMenuStore } from "@/store/MenuStore";

describe("Menu Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("when show is false and toggling", function () {
    it("should have show on true value", () => {
      const store = useMenuStore();

      store.toggle();

      expect(store.show).to.be.true;
    });
  });
  describe("when show is true and toggling", function () {
    it("should have show on false value", () => {
      const store = useMenuStore();
      store.show = true;

      store.toggle();

      expect(store.show).to.be.false;
    });
  });
});
