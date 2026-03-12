<script setup>
import Tag from "primevue/tag";

defineProps({
  item: {
    type: Object,
    required: true,
  },
});

function formatDate(value) {
  if (!value) return "sem atualização registrada";

  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
</script>

<template>
  <article class="gift-card gift-card--selected">
    <div class="gift-card__media">
      <img
        :src="item.image"
        :alt="item.name"
        loading="lazy"
      >
      <Tag
        value="Já reservado"
        severity="info"
        rounded
      />
    </div>

    <div class="gift-card__content">
      <div class="gift-card__heading">
        <h3>{{ item.name }}</h3>
        <p>
          {{ item.quantity }} unidade(s)
          <span v-if="item.selectionType === 'limited' && item.maxQuantity">
            de {{ item.maxQuantity }}
          </span>
        </p>
      </div>

      <p class="gift-card__timestamp">
        Atualizado em {{ formatDate(item.updatedAt) }}
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
          Abrir loja
        </a>
      </div>
    </div>
  </article>
</template>
