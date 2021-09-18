import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import Editor from "@/views/Editor.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/authorize_callback",
    component: Editor,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
