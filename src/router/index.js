import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import SelectedView from "@/views/SelectedView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
    meta: {
      title: "Lista de Presentes",
    },
  },
  {
    path: "/selecionados",
    name: "selected",
    component: SelectedView,
    meta: {
      title: "Itens Selecionados",
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

router.afterEach((to) => {
  document.title = `${to.meta.title || "Chá de Bebê"} | Felipe e Sara`;
});

export default router;
