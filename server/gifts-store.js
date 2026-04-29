import { readFile } from "node:fs/promises";
import path from "node:path";

const giftsFile = path.join(process.cwd(), "data", "gifts.json");

function normalizeLegacyIds(legacyIds, itemId) {
  if (!Array.isArray(legacyIds)) return [];

  return [...new Set(legacyIds)].filter(
    (legacyId) => typeof legacyId === "string" && legacyId && legacyId !== itemId,
  );
}

function normalizeItem(item, index) {
  const id = item.id || `item-${index + 1}`;
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
    id,
    name: item.name || "Item sem nome",
    storeUrl: item.storeUrl || "",
    image: item.imageUrl || item.image || "",
    isSelectable: item.isSelectable !== false,
    selectionType,
    maxQuantity,
    legacyIds: normalizeLegacyIds(item.legacyIds, id),
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
  return Object.fromEntries(
    giftItems.flatMap((item) => [
      [item.id, item],
      ...item.legacyIds.map((legacyId) => [legacyId, item]),
    ]),
  );
}
