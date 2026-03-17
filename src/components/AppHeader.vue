<script setup>
import { useRoute } from "vue-router";
import { useI18n } from "@/composables/useI18n";

const route = useRoute();
const { locale, localeOptions, setLocale, t } = useI18n();

const links = [
  {
    labelKey: "header.navList",
    to: "/#presentes",
    path: "/",
    hash: "#presentes",
    icon: "pi pi-gift",
  },
  {
    labelKey: "header.navSelected",
    to: "/selecionados",
    path: "/selecionados",
    icon: "pi pi-heart-fill",
  },
];

function isActive(link) {
  return route.path === link.path;
}

function handleLinkClick(link) {
  if (!link.hash || route.path !== link.path) return;

  requestAnimationFrame(() => {
    document.querySelector(link.hash)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
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
          <span class="brand-mark__eyebrow">{{ t("header.brandEyebrow") }}</span>
          <strong class="brand-mark__title">{{ t("header.brandTitle") }}</strong>
        </span>
      </RouterLink>

      <div class="app-header__actions">
        <nav
          class="app-header__nav"
          :aria-label="t('header.navLabel')"
        >
          <RouterLink
            v-for="link in links"
            :key="link.labelKey"
            :to="link.to"
            class="nav-chip"
            :class="{ 'is-active': isActive(link) }"
            @click="handleLinkClick(link)"
          >
            <i
              :class="link.icon"
              aria-hidden="true"
            />
            <span>{{ t(link.labelKey) }}</span>
          </RouterLink>
        </nav>

        <div
          class="locale-switcher"
          :aria-label="t('header.localeLabel')"
          role="group"
        >
          <button
            v-for="option in localeOptions"
            :key="option.code"
            type="button"
            class="locale-switcher__button"
            :class="{ 'is-active': locale === option.code }"
            :aria-pressed="locale === option.code"
            :aria-label="t(option.nameKey)"
            @click="setLocale(option.code)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
