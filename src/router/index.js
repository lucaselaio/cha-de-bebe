import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import SelectedView from "@/views/SelectedView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
    meta: {
      titleKey: "meta.home",
    },
  },
  {
    path: "/selecionados",
    name: "selected",
    component: SelectedView,
    meta: {
      titleKey: "meta.selected",
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) {
      return {
        el: to.hash,
        top: 24,
        behavior: "smooth",
      };
    }

    return {
      top: 0,
      behavior: "smooth"
    };
  },
});

export default router;
