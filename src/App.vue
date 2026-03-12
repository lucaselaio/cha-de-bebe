<script setup>
import Toast from "primevue/toast";
import AppHeader from "@/components/AppHeader.vue";
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
