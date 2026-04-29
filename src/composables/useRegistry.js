import { reactive, toRefs } from "vue";
import { fetchRegistry, updateRegistry } from "@/services/selections";

const state = reactive({
  giftItems: [],
  selectionById: {},
  selectedItems: [],
  totalSelectedUnits: 0,
  totalSelectedTypes: 0,
  totalItems: 0,
  isLoading: false,
  hasLoaded: false,
});

function applyPayload(payload) {
  state.giftItems = payload.giftItems ?? [];
  state.selectionById = payload.selectionById ?? {};
  state.selectedItems = payload.selectedItems ?? [];
  state.totalSelectedUnits = payload.totalSelectedUnits ?? 0;
  state.totalSelectedTypes = payload.totalSelectedTypes ?? 0;
  state.totalItems = payload.totalItems ?? 0;
  state.hasLoaded = true;
}

export function useRegistry() {
  async function loadRegistry(force = false) {
    if ((state.isLoading || state.hasLoaded) && !force) return;

    state.isLoading = true;

    try {
      applyPayload(await fetchRegistry());
    } finally {
      state.isLoading = false;
    }
  }

  async function mutateSelection(itemId, action) {
    const method = action === "increment" ? "POST" : "DELETE";
    applyPayload(await updateRegistry(itemId, method));
  }

  function getSelection(item) {
    return (
      state.selectionById[item.id] ?? {
        quantity: 0,
        isSelectable: item.isSelectable !== false,
        maxQuantity: item.maxQuantity,
        selectionType: item.selectionType,
        isAtLimit: false,
      }
    );
  }

  return {
    ...toRefs(state),
    loadRegistry,
    mutateSelection,
    getSelection,
  };
}
