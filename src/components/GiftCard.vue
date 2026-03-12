<script setup>
import { computed } from "vue";
import Button from "primevue/button";
import ProgressBar from "primevue/progressbar";
import Tag from "primevue/tag";

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

const quantity = computed(() => props.selection.quantity ?? 0);
const canIncrement = computed(() => !props.selection.isAtLimit);
const canDecrement = computed(() => quantity.value > 0);
const isLimited = computed(() => props.item.selectionType === "limited");

const statusLabel = computed(() => {
  if (isLimited.value && typeof props.item.maxQuantity === "number") {
    return `${quantity.value} de ${props.item.maxQuantity} reservado(s)`;
  }

  return `${quantity.value} unidade(s) reservada(s)`;
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
        :src="item.image"
        :alt="item.name"
        loading="lazy"
      >
      <Tag
        :value="isLimited ? 'Quantidade limitada' : 'Pode repetir'"
        :severity="isLimited ? 'warn' : 'success'"
        rounded
      />
    </div>

    <div class="gift-card__content">
      <div class="gift-card__heading">
        <h3>{{ item.name }}</h3>
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
          Ver na loja
        </a>

        <div class="gift-card__actions">
          <Button
            icon="pi pi-heart"
            label="Reservar 1"
            severity="success"
            rounded
            :disabled="!canIncrement"
            @click="$emit('reserve')"
          />

          <Button
            icon="pi pi-minus-circle"
            label="Remover 1"
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
