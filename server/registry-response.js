import { readGiftItems } from "./gifts-store.js";

function sortByUpdatedAtDesc(items) {
  return [...items].sort((a, b) => {
    const first = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const second = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return second - first;
  });
}

function getSelectionIds(item) {
  return [item.id, ...(Array.isArray(item.legacyIds) ? item.legacyIds : [])];
}

function getUpdatedAtTime(updatedAt) {
  if (!updatedAt) return 0;

  const timestamp = new Date(updatedAt).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getSelectionSnapshot(item, selections) {
  let quantity = 0;
  let updatedAt = null;

  for (const selectionId of getSelectionIds(item)) {
    const selection = selections[selectionId];
    const currentQuantity = selection?.quantity ?? 0;

    if (currentQuantity > 0) {
      quantity += currentQuantity;
    }

    if (getUpdatedAtTime(selection?.updatedAt) > getUpdatedAtTime(updatedAt)) {
      updatedAt = selection.updatedAt;
    }
  }

  return { quantity, updatedAt };
}

export async function buildRegistryResponse(selections) {
  const giftItems = await readGiftItems();
  const selectionById = {};
  const selectedItems = [];

  for (const item of giftItems) {
    const { quantity, updatedAt } = getSelectionSnapshot(item, selections);
    const isAtLimit =
      item.selectionType === "limited" &&
      typeof item.maxQuantity === "number" &&
      quantity >= item.maxQuantity;

    selectionById[item.id] = {
      quantity,
      isSelectable: item.isSelectable !== false,
      maxQuantity: item.maxQuantity,
      selectionType: item.selectionType,
      isAtLimit,
    };

    if (quantity > 0) {
      selectedItems.push({
        ...item,
        quantity,
        updatedAt,
      });
    }
  }

  return {
    giftItems,
    selectionById,
    selectedItems: sortByUpdatedAtDesc(selectedItems),
    totalSelectedUnits: selectedItems.reduce((sum, item) => sum + item.quantity, 0),
    totalSelectedTypes: selectedItems.length,
    totalItems: giftItems.length,
  };
}
