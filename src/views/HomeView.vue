<script setup>
import { computed, onMounted, ref } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Image from "primevue/image";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import { useToast } from "primevue/usetoast";
import GiftCard from "@/components/GiftCard.vue";
import StatPill from "@/components/StatPill.vue";
import { useI18n } from "@/composables/useI18n";
import { useRegistry } from "@/composables/useRegistry";

const eventAddress = "373 Lincoln St, Marlborough, MA 01752";
const eventMapUrl =
  "https://www.google.com/maps/search/?api=1&query=373+Lincoln+St,+Marlborough,+MA+01752";

const toast = useToast();
const { getErrorMessage, getGiftName, t } = useI18n();
const {
  giftItems,
  selectionById,
  totalItems,
  totalSelectedTypes,
  totalSelectedUnits,
  isLoading,
  loadRegistry,
  mutateSelection,
  getSelection,
} =
  useRegistry();

const pendingAction = ref(null);
const isSaving = ref(false);
const eventDate = computed(() => t("home.eventDate"));
const eventTime = computed(() => t("home.eventTime"));
const eventSummary = computed(() =>
  t("home.eventSummary", {
    date: eventDate.value,
    time: eventTime.value,
  }),
);

const modalText = computed(() => {
  if (!pendingAction.value) return "";

  if (pendingAction.value.action === "increment") {
    return t("home.confirmReserve", { itemName: pendingAction.value.itemName });
  }

  return t("home.confirmRemove", { itemName: pendingAction.value.itemName });
});

function askConfirmation(item, action) {
  pendingAction.value = {
    itemId: item.id,
    itemName: getGiftName(item),
    action,
  };
}

function closeDialog() {
  if (isSaving.value) return;
  pendingAction.value = null;
}

function showActionToast(action) {
  toast.add({
    severity: action === "increment" ? "success" : "info",
    summary: action === "increment" ? t("home.reserveSummary") : t("home.updateSummary"),
    detail: action === "increment" ? t("home.reserveDetail") : t("home.updateDetail"),
    life: 3200,
  });
}

async function confirmAction() {
  if (!pendingAction.value || isSaving.value) return;

  isSaving.value = true;
  const { action, itemId } = pendingAction.value;
  const previousQuantity = selectionById.value[itemId]?.quantity ?? 0;

  try {
    await mutateSelection(itemId, action);
    pendingAction.value = null;
    showActionToast(action);
  } catch (error) {
    let hasAppliedChange = false;

    try {
      await loadRegistry(true);

      const currentQuantity = selectionById.value[itemId]?.quantity ?? 0;
      const expectedQuantity =
        action === "increment" ? previousQuantity + 1 : Math.max(0, previousQuantity - 1);

      hasAppliedChange = currentQuantity === expectedQuantity;
    } catch {
      hasAppliedChange = false;
    }

    if (hasAppliedChange) {
      pendingAction.value = null;
      showActionToast(action);
      return;
    }

    toast.add({
      severity: "error",
      summary: t("home.actionErrorSummary"),
      detail: getErrorMessage(error),
      life: 4200,
    });
  } finally {
    isSaving.value = false;
  }
}

onMounted(async () => {
  try {
    await loadRegistry();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: t("home.loadErrorSummary"),
      detail: getErrorMessage(error),
      life: 4200,
    });
  }
});
</script>

<template>
  <div class="page-stack">
    <section class="section-card event-strip">
      <div class="event-strip__intro">
        <span class="section-card__eyebrow">{{ t("home.eventEyebrow") }}</span>
        <h3 class="event-strip__summary">
          {{ eventSummary }}
        </h3>
        <h3 class="event-strip__summary">
          {{ eventAddress }}
        </h3>
        <h3 class="event-strip__summary">
          {{ t("home.eventVenue") }}
        </h3>
      </div>

      <a
        :href="eventMapUrl"
        class="soft-link soft-link--alt event-strip__cta"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i
          class="pi pi-map"
          aria-hidden="true"
        />
        {{ t("home.openMap") }}
      </a>
    </section>

    <section class="hero-panel">
      <div class="hero-panel__copy">
        <span class="hero-panel__eyebrow">{{ t("home.heroEyebrow") }}</span>
        <h1>{{ t("home.heroTitle") }}</h1>
        <p>
          {{ t("home.heroBodyStart") }}
          <b>{{ t("home.heroSuggestion") }}</b>
          {{ t("home.heroBodyEnd") }} 💛
        </p>

        <div class="hero-panel__actions">
          <a
            href="#presentes"
            class="soft-link"
          >{{ t("home.viewGifts") }}</a>
          <RouterLink
            to="/selecionados"
            class="soft-link soft-link--alt"
          >
            {{ t("home.viewSelected") }}
          </RouterLink>
        </div>
      </div>

      <div
        class="hero-panel__art"
        aria-hidden="true"
      >
        <Image
          class="hero-panel__bear"
          src="/images/ursinho.png"
          height="250"
        />
      </div>
    </section>

    <section
      class="stats-grid"
      :aria-label="t('home.statsLabel')"
    >
      <StatPill
        icon="pi pi-gift"
        :value="totalItems"
        :label="t('home.statsSuggested')"
      />
      <StatPill
        icon="pi pi-heart-fill"
        :value="totalSelectedTypes"
        :label="t('home.statsChosen')"
      />
      <StatPill
        icon="pi pi-box"
        :value="totalSelectedUnits"
        :label="t('home.statsReserved')"
      />
    </section>

    <section
      id="presentes"
      class="section-card"
    >
      <div class="section-card__header">
        <div>
          <span class="section-card__eyebrow">{{ t("home.suggestionsEyebrow") }}</span>
          <h2>{{ t("home.suggestionsTitle") }}</h2>
        </div>

        <Message
          severity="secondary"
          size="small"
          variant="simple"
        >
          {{ t("home.suggestionsMessage") }}
        </Message>
      </div>

      <div
        v-if="isLoading && !giftItems.length"
        class="loading-state"
      >
        <ProgressSpinner stroke-width="5" />
        <p>{{ t("home.loading") }}</p>
      </div>

      <div
        v-else
        class="gift-grid"
      >
        <GiftCard
          v-for="item in giftItems"
          :key="item.id"
          :item="item"
          :selection="getSelection(item)"
          @reserve="askConfirmation(item, 'increment')"
          @remove="askConfirmation(item, 'decrement')"
        />
      </div>
    </section>

    <section class="section-card">
      <div class="event-strip__intro footer-card">
        <h3 class="event-strip__summary">
          {{ t("home.shippingTitle") }}
        </h3>
        <h3 class="event-strip__summary">
          {{ t("home.shippingAddress") }}
          {{ t("home.shippingThanks") }}
        </h3>
        <p>
          {{ t("home.shippingReminder") }} 🩷💙
        </p>
      </div>
    </section>

    <Dialog
      :visible="Boolean(pendingAction)"
      modal
      dismissable-mask
      :draggable="false"
      class="confirm-dialog"
      :header="t('home.confirmTitle')"
      @update:visible="closeDialog"
    >
      <p class="confirm-dialog__text">
        {{ modalText }}
      </p>

      <template #footer>
        <Button
          :label="t('home.cancel')"
          severity="secondary"
          text
          rounded
          :disabled="isSaving"
          @click="closeDialog"
        />
        <Button
          :label="isSaving ? t('home.saving') : t('home.confirm')"
          icon="pi pi-check"
          rounded
          :loading="isSaving"
          @click="confirmAction"
        />
      </template>
    </Dialog>
  </div>
</template>
