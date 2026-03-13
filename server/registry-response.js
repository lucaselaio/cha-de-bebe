import { readGiftItems } from "./gifts-store.js";

function sortByUpdatedAtDesc(items) {
  return [...items].sort((a, b) => {
    const first = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const second = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return second - first;
  });
}

export async function buildRegistryResponse(selections) {
  const giftItems = await readGiftItems();
  const selectionById = {};
  const selectedItems = [];

  for (const item of giftItems) {
    const quantity = selections[item.id]?.quantity ?? 0;
    const isAtLimit =
      item.selectionType === "limited" &&
      typeof item.maxQuantity === "number" &&
      quantity >= item.maxQuantity;

    selectionById[item.id] = {
      quantity,
      maxQuantity: item.maxQuantity,
      selectionType: item.selectionType,
      isAtLimit,
    };

    if (quantity > 0) {
      selectedItems.push({
        ...item,
        quantity,
        updatedAt: selections[item.id]?.updatedAt ?? null,
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
