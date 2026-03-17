<script setup>
import { watchEffect } from "vue";
import Toast from "primevue/toast";
import { useRoute } from "vue-router";
import AppHeader from "@/components/AppHeader.vue";
import { useI18n } from "@/composables/useI18n";

const route = useRoute();
const { t } = useI18n();

watchEffect(() => {
  document.title = `${t(route.meta.titleKey || "meta.home")} | ${t("meta.site")}`;
});
</script>

<template>
  <div class="app-shell">
    <div
      class="app-shell__halo app-shell__halo--left"
      aria-hidden="true"
    />
    <div
      class="app-shell__halo app-shell__halo--right"
      aria-hidden="true"
    />
    <div
      class="app-shell__dots"
      aria-hidden="true"
    />

    <AppHeader />

    <main class="page-shell">
      <RouterView />
    </main>

    <Toast position="top-right" />
  </div>
</template>
