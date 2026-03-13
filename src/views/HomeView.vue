<script setup>
import { computed, onMounted, ref } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import { useToast } from "primevue/usetoast";
import GiftCard from "@/components/GiftCard.vue";
import StatPill from "@/components/StatPill.vue";
import { useRegistry } from "@/composables/useRegistry";
import Image from "primevue/image";

const eventDate = "25 de abril";
const eventTime = "6:00 PM";
const eventAddress = "373 Lincoln St, Marlborough, MA 01752";
const eventMapUrl =
  "https://www.google.com/maps/search/?api=1&query=373+Lincoln+St,+Marlborough,+MA+01752";
const eventSummary = `${eventDate} às ${eventTime}`;

const toast = useToast();
const { giftItems, totalItems, totalSelectedTypes, totalSelectedUnits, isLoading, loadRegistry, mutateSelection, getSelection } =
  useRegistry();

const pendingAction = ref(null);
const isSaving = ref(false);

const modalText = computed(() => {
  if (!pendingAction.value) return "";

  if (pendingAction.value.action === "increment") {
    return `Deseja reservar 1 unidade de "${pendingAction.value.itemName}"?`;
  }

  return `Deseja remover 1 unidade de "${pendingAction.value.itemName}" da lista de selecionados?`;
});

function askConfirmation(item, action) {
  pendingAction.value = {
    itemId: item.id,
    itemName: item.name,
    action,
  };
}

function closeDialog() {
  if (isSaving.value) return;
  pendingAction.value = null;
}

async function confirmAction() {
  if (!pendingAction.value || isSaving.value) return;

  isSaving.value = true;

  try {
    const action = pendingAction.value.action;

    await mutateSelection(pendingAction.value.itemId, action);
    pendingAction.value = null;

    toast.add({
      severity: action === "increment" ? "success" : "info",
      summary: action === "increment" ? "Reserva confirmada" : "Reserva atualizada",
      detail:
        action === "increment"
          ? "Obrigada por escolher um presente para os bebês."
          : "A quantidade reservada foi ajustada.",
      life: 3200,
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Nao foi possivel concluir",
      detail: error.message,
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
      summary: "Erro ao carregar",
      detail: error.message,
      life: 4200,
    });
  }
});
</script>

<template>
  <div class="page-stack">
    <section class="section-card event-strip">
      <div class="event-strip__intro">
        <span class="section-card__eyebrow">Informações do evento</span>
        <h3 class="event-strip__summary">
          {{ eventSummary }}
        </h3>
        <h3 class="event-strip__summary">
          {{ eventAddress }}
        </h3>
        <h3 class="event-strip__summary">
          Bethel Presbyterian Church (Salão de festas)
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
        Abrir no mapa
      </a>
    </section>
    
    <section class="hero-panel">
      <div class="hero-panel__copy">
        <span class="hero-panel__eyebrow">Chá de bebê dos gêmeos</span>
        <h1>Uma lista delicada para celebrar a chegada de Felipe e Sara.</h1>
        <p>
          Preparamos esta lista com muito carinho apenas como uma <b>sugestão</b> para quem desejar nos presentear.
          O mais importante para nós é a sua presença e o carinho nesse momento tão especial.💛
        </p>

        <div class="hero-panel__actions">
          <a
            href="#presentes"
            class="soft-link"
          >Ver presentes</a>
          <RouterLink
            to="/selecionados"
            class="soft-link soft-link--alt"
          >
            Itens selecionados
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
      aria-label="Resumo da lista"
    >
      <StatPill
        icon="pi pi-gift"
        :value="totalItems"
        label="presentes sugeridos"
      />
      <StatPill
        icon="pi pi-heart-fill"
        :value="totalSelectedTypes"
        label="itens já escolhidos"
      />
      <StatPill
        icon="pi pi-box"
        :value="totalSelectedUnits"
        label="unidades reservadas"
      />
    </section>

    <section
      id="presentes"
      class="section-card"
    >
      <div class="section-card__header">
        <div>
          <span class="section-card__eyebrow">Sugestões</span>
          <h2>Presentes para o quartinho e para o dia a dia</h2>
        </div>

        <Message
          severity="secondary"
          size="small"
          variant="simple"
        />
      </div>

      <div
        v-if="isLoading && !giftItems.length"
        class="loading-state"
      >
        <ProgressSpinner stroke-width="5" />
        <p>Carregando a lista com todo carinho...</p>
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
          Para quem preferir, os presentes também podem ser enviados diretamente para nossa casa:
        </h3>
        <h3 class="event-strip__summary">
          11 colonial rd, apt 12, Milford, MA, 01757
          Muito obrigado por todo carinho!
        </h3>
        <p>
          Lembrando, é apenas uma sugestão.🩷💙
        </p>
      </div>
    </section>

    <Dialog
      :visible="Boolean(pendingAction)"
      modal
      dismissable-mask
      :draggable="false"
      class="confirm-dialog"
      header="Confirmar ação"
      @update:visible="closeDialog"
    >
      <p class="confirm-dialog__text">
        {{ modalText }}
      </p>

      <template #footer>
        <Button
          label="Cancelar"
          severity="secondary"
          text
          rounded
          :disabled="isSaving"
          @click="closeDialog"
        />
        <Button
          :label="isSaving ? 'Salvando...' : 'Confirmar'"
          icon="pi pi-check"
          rounded
          :loading="isSaving"
          @click="confirmAction"
        />
      </template>
    </Dialog>
  </div>
</template>
