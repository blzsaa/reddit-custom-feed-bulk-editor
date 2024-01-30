import { defineStore } from "pinia";

export const useMenuStore = defineStore("menu", {
  state: () => ({
    show: false as boolean,
  }),
  actions: {
    toggle() {
      this.show = !this.show;
    },
  },
});
