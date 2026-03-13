<script setup>
import { useRoute } from "vue-router";

const route = useRoute();

const links = [
  {
    label: "Lista",
    to: "/",
    icon: "pi pi-gift",
  },
  {
    label: "Selecionados",
    to: "/selecionados",
    icon: "pi pi-heart-fill",
  },
];

function isActive(path) {
  return route.path === path;
}
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <RouterLink
        to="/"
        class="brand-mark"
      >
        <span class="brand-mark__badge">
          <i
            class="pi pi-heart-fill"
            aria-hidden="true"
          />
        </span>

        <span class="brand-mark__body">
          <span class="brand-mark__eyebrow">Chá de bebê</span>
          <strong class="brand-mark__title">Felipe e Sara</strong>
          <span class="brand-mark__subtitle">um cantinho fofo para os gêmeos</span>
        </span>
      </RouterLink>

      <nav
        class="app-header__nav"
        aria-label="Navegação principal"
      >
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="nav-chip"
          :class="{ 'is-active': isActive(link.to) }"
        >
          <i
            :class="link.icon"
            aria-hidden="true"
          />
          <span>{{ link.label }}</span>
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
