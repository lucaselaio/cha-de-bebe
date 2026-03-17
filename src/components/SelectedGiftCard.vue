<script setup>
import { computed } from "vue";
import Tag from "primevue/tag";
import { useI18n } from "@/composables/useI18n";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const { formatDateTime, getGiftName, t } = useI18n();
const itemName = computed(() => getGiftName(props.item));
const quantityLabel = computed(() =>
  t("selectedGift.quantity", {
    quantity: props.item.quantity,
    maxQuantity: props.item.maxQuantity,
    isLimited: props.item.selectionType === "limited",
  }),
);
</script>

<template>
  <article class="gift-card gift-card--selected">
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
        :value="t('selectedGift.reservedTag')"
        severity="info"
        rounded
      />
    </div>

    <div class="gift-card__content">
      <div class="gift-card__heading">
        <h3>{{ itemName }}</h3>
        <p>{{ quantityLabel }}</p>
      </div>

      <p class="gift-card__timestamp">
        {{ t("selectedGift.updatedAt", { date: formatDateTime(item.updatedAt) }) }}
      </p>

      <div class="gift-card__footer">
        <a
          class="gift-card__store"
          :href="item.storeUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i
            class="pi pi-shopping-bag"
            aria-hidden="true"
          />
          {{ t("selectedGift.openStore") }}
        </a>
      </div>
    </div>
  </article>
</template>
