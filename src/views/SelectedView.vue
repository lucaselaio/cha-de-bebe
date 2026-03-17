<script setup>
import { onMounted } from "vue";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import { useToast } from "primevue/usetoast";
import SelectedGiftCard from "@/components/SelectedGiftCard.vue";
import StatPill from "@/components/StatPill.vue";
import { useI18n } from "@/composables/useI18n";
import { useRegistry } from "@/composables/useRegistry";

const toast = useToast();
const { getErrorMessage, t } = useI18n();
const { selectedItems, totalSelectedTypes, totalSelectedUnits, totalItems, isLoading, loadRegistry } =
  useRegistry();

onMounted(async () => {
  try {
    await loadRegistry();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: t("selected.loadErrorSummary"),
      detail: getErrorMessage(error),
      life: 4200,
    });
  }
});
</script>

<template>
  <div class="page-stack">
    <section class="section-card section-card--compact">
      <div class="section-card__header section-card__header--stack">
        <div>
          <span class="section-card__eyebrow">{{ t("selected.eyebrow") }}</span>
          <h1>{{ t("selected.title") }}</h1>
          <p class="section-card__lede">
            {{ t("selected.lede") }}
          </p>
        </div>

        <RouterLink
          to="/"
          class="soft-link soft-link--alt"
        >
          {{ t("selected.backToList") }}
        </RouterLink>
      </div>
    </section>

    <section
      class="stats-grid"
      :aria-label="t('selected.statsLabel')"
    >
      <StatPill
        icon="pi pi-heart-fill"
        :value="totalSelectedTypes"
        :label="t('selected.statsTypes')"
      />
      <StatPill
        icon="pi pi-box"
        :value="totalSelectedUnits"
        :label="t('selected.statsUnits')"
      />
      <StatPill
        icon="pi pi-gift"
        :value="totalItems"
        :label="t('selected.statsTotal')"
      />
    </section>

    <section class="section-card">
      <div class="section-card__header">
        <div>
          <span class="section-card__eyebrow">{{ t("selected.sectionEyebrow") }}</span>
          <h2>{{ t("selected.sectionTitle") }}</h2>
        </div>

        <Message
          severity="info"
          size="small"
        >
          {{ t("selected.sectionMessage") }}
        </Message>
      </div>

      <div
        v-if="isLoading && !selectedItems.length"
        class="loading-state"
      >
        <ProgressSpinner stroke-width="5" />
        <p>{{ t("selected.loading") }}</p>
      </div>

      <div
        v-else-if="!selectedItems.length"
        class="empty-state"
      >
        <i
          class="pi pi-heart empty-state__icon"
          aria-hidden="true"
        />
        <h3>{{ t("selected.emptyTitle") }}</h3>
        <p>{{ t("selected.emptyBody") }}</p>
      </div>

      <div
        v-else
        class="gift-grid"
      >
        <SelectedGiftCard
          v-for="item in selectedItems"
          :key="item.id"
          :item="item"
        />
      </div>
    </section>
  </div>
</template>
