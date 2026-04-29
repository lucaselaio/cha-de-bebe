<script setup>
import { computed } from "vue";
import Button from "primevue/button";
import ProgressBar from "primevue/progressbar";
import Tag from "primevue/tag";
import { useI18n } from "@/composables/useI18n";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  selection: {
    type: Object,
    required: true,
  },
});

defineEmits(["reserve", "remove"]);

const { getGiftName, t } = useI18n();
const quantity = computed(() => props.selection.quantity ?? 0);
const isSelectable = computed(() => props.selection.isSelectable !== false);
const canIncrement = computed(() => isSelectable.value && !props.selection.isAtLimit);
const canDecrement = computed(() => quantity.value > 0);
const isLimited = computed(() => props.item.selectionType === "limited");
const itemName = computed(() => getGiftName(props.item));

const statusLabel = computed(() => {
  if (!isSelectable.value) {
    return t("giftCard.unavailableTag");
  }

  if (isLimited.value && typeof props.item.maxQuantity === "number") {
    return t("giftCard.statusLimited", {
      quantity: quantity.value,
      maxQuantity: props.item.maxQuantity,
    });
  }

  return t("giftCard.statusStackable", {
    quantity: quantity.value,
  });
});

const progressValue = computed(() => {
  if (!isLimited.value || typeof props.item.maxQuantity !== "number") return 0;
  return Math.min(100, Math.round((quantity.value / props.item.maxQuantity) * 100));
});
</script>

<template>
  <article class="gift-card">
    <div class="gift-card__media">
      <img
        v-if="item.image"
        :src="item.image"
        :alt="itemName"
        loading="lazy"
      >
      <div
        v-else
        class="gift-card__image-fallback"
        aria-hidden="true"
      >
        <i class="pi pi-image" />
        <span>{{ t("giftCard.imageSoon") }}</span>
      </div>
      <Tag
        :value="!isSelectable ? t('giftCard.unavailableTag') : isLimited ? t('giftCard.limitedTag') : t('giftCard.repeatableTag')"
        :severity="!isSelectable ? 'contrast' : isLimited ? 'warn' : 'success'"
        rounded
      />
    </div>

    <div class="gift-card__content">
      <div class="gift-card__heading">
        <h3>{{ itemName }}</h3>
        <p>{{ statusLabel }}</p>
      </div>

      <ProgressBar
        v-if="isLimited"
        :value="progressValue"
        :show-value="false"
        class="gift-card__progress"
      />

      <div class="gift-card__footer">
        <a
          class="gift-card__store"
          :href="item.storeUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i
            class="pi pi-external-link"
            aria-hidden="true"
          />
          {{ t("giftCard.viewStore") }}
        </a>

        <div class="gift-card__actions">
          <Button
            icon="pi pi-heart"
            :label="t('giftCard.reserveOne')"
            rounded
            :disabled="!canIncrement"
            @click="$emit('reserve')"
          />

          <Button
            icon="pi pi-minus-circle"
            :label="t('giftCard.removeOne')"
            severity="secondary"
            text
            rounded
            :disabled="!canDecrement"
            @click="$emit('remove')"
          />
        </div>
      </div>
    </div>
  </article>
</template>
