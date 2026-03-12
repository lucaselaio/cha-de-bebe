import { readFile } from "node:fs/promises";
import path from "node:path";

const giftsFile = path.join(process.cwd(), "data", "gifts.json");

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
    image: item.imageUrl || item.image || "",
    selectionType,
    maxQuantity,
  };
}

export async function readGiftItems() {
  const raw = await readFile(giftsFile, "utf-8");

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((item, index) => normalizeItem(item, index)) : [];
  } catch {
    return [];
  }
}

export async function readGiftItemsById() {
  const giftItems = await readGiftItems();
  return Object.fromEntries(giftItems.map((item) => [item.id, item]));
}
