<script setup>
import { onMounted } from "vue";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import { useToast } from "primevue/usetoast";
import SelectedGiftCard from "@/components/SelectedGiftCard.vue";
import StatPill from "@/components/StatPill.vue";
import { useRegistry } from "@/composables/useRegistry";

const toast = useToast();
const { selectedItems, totalSelectedTypes, totalSelectedUnits, totalItems, isLoading, loadRegistry } =
  useRegistry();

onMounted(async () => {
  try {
    await loadRegistry();
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Erro ao carregar",
      detail: error.message,
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
          <span class="section-card__eyebrow">Acompanhamento</span>
          <h1>Itens que já ganharam dono</h1>
          <p class="section-card__lede">
            Esta página ajuda a evitar duplicidade e mostra o carinho que já começou a chegar.
          </p>
        </div>

        <RouterLink
          to="/"
          class="soft-link soft-link--alt"
        >
          Voltar para a lista
        </RouterLink>
      </div>
    </section>

    <section
      class="stats-grid"
      aria-label="Resumo dos itens selecionados"
    >
      <StatPill
        icon="pi pi-heart-fill"
        :value="totalSelectedTypes"
        label="tipos já reservados"
      />
      <StatPill
        icon="pi pi-box"
        :value="totalSelectedUnits"
        label="unidades confirmadas"
      />
      <StatPill
        icon="pi pi-gift"
        :value="totalItems"
        label="presentes no total"
      />
    </section>

    <section class="section-card">
      <div class="section-card__header">
        <div>
          <span class="section-card__eyebrow">Selecionados</span>
          <h2>Presentes já escolhidos</h2>
        </div>

        <Message
          severity="info"
          size="small"
        >
          As datas mostram a atualização mais recente de cada presente reservado.
        </Message>
      </div>

      <div
        v-if="isLoading && !selectedItems.length"
        class="loading-state"
      >
        <ProgressSpinner stroke-width="5" />
        <p>Buscando as reservas confirmadas...</p>
      </div>

      <div
        v-else-if="!selectedItems.length"
        class="empty-state"
      >
        <i
          class="pi pi-heart empty-state__icon"
          aria-hidden="true"
        />
        <h3>Ainda nao ha presentes reservados.</h3>
        <p>Quando alguem escolher um item, ele vai aparecer aqui para manter tudo organizado.</p>
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
