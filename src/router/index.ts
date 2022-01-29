import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import Editor from "@/views/Editor.vue";
import Callback from "@/views/Callback.vue";
import { useMultiFeedStore } from "@/store/MultifeedStore";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/authorize_callback",
    component: Callback,
  },
  {
    path: "/editor",
    component: Editor,
    meta: { requiresAccessToken: true },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const multiFeedStore = useMultiFeedStore();
  if (to.meta.requiresAccessToken && multiFeedStore.accessToken === "") {
    next({ path: "/" });
  } else {
    next();
  }
});
export default router;
