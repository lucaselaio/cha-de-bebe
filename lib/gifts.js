import giftsData from "../data/gifts.json";

function normalizeItem(item, index) {
  const selectionType =
    typeof item.stackable === "boolean"
      ? item.stackable
        ? "stackable"
        : "limited"
      : item.selectionType === "limited"
        ? "limited"
        : "stackable";
  const maxQuantity =
    selectionType === "limited" && Number.isFinite(item.maxQuantity)
      ? Math.max(1, Math.floor(item.maxQuantity))
      : null;

  return {
    id: item.id || `item-${index + 1}`,
    name: item.name || "Item sem nome",
    storeUrl: item.storeUrl || "",
    image: item.image || "",
    selectionType,
    maxQuantity,
  };
}

export const giftItems = Array.isArray(giftsData)
  ? giftsData.map((item, index) => normalizeItem(item, index))
  : [];

export const giftItemsById = Object.fromEntries(giftItems.map((item) => [item.id, item]));
