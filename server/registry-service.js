import { readGiftItemsById } from "./gifts-store.js";
import { buildRegistryResponse } from "./registry-response.js";
import {
  SelectionEmptyError,
  SelectionLimitReachedError,
  StorageNotConfiguredError,
  decrementItemSelection,
  incrementItemSelection,
  readSelections,
} from "./selections-store.js";

class InvalidItemError extends Error {
  constructor() {
    super("Item inválido.");
    this.name = "InvalidItemError";
    this.statusCode = 400;
  }
}

class ItemUnavailableError extends Error {
  constructor() {
    super("Este item não está disponível para seleção no momento.");
    this.name = "ItemUnavailableError";
    this.statusCode = 409;
  }
}

function getSelectionIds(item) {
  return [item.id, ...(Array.isArray(item.legacyIds) ? item.legacyIds : [])];
}

function getAggregatedQuantity(item, selections) {
  return getSelectionIds(item).reduce((total, selectionId) => {
    const quantity = selections[selectionId]?.quantity ?? 0;
    return total + (quantity > 0 ? quantity : 0);
  }, 0);
}

function getLegacyQuantity(item, selections) {
  return (Array.isArray(item.legacyIds) ? item.legacyIds : []).reduce((total, selectionId) => {
    const quantity = selections[selectionId]?.quantity ?? 0;
    return total + (quantity > 0 ? quantity : 0);
  }, 0);
}

function getSelectionIdToRelease(item, selections) {
  if ((selections[item.id]?.quantity ?? 0) > 0) {
    return item.id;
  }

  return (Array.isArray(item.legacyIds) ? item.legacyIds : []).find(
    (selectionId) => (selections[selectionId]?.quantity ?? 0) > 0,
  );
}

function readItem(itemId, giftItemsById) {
  if (!itemId || !giftItemsById[itemId]) {
    throw new InvalidItemError();
  }

  return giftItemsById[itemId];
}

export async function getRegistryResponse() {
  return buildRegistryResponse(await readSelections());
}

export async function reserveItem(itemId) {
  const giftItemsById = await readGiftItemsById();
  const item = readItem(itemId, giftItemsById);

  if (item.isSelectable === false) {
    throw new ItemUnavailableError();
  }

  const currentSelections = await readSelections();
  const currentQuantity = getAggregatedQuantity(item, currentSelections);

  if (
    item.selectionType === "limited" &&
    typeof item.maxQuantity === "number" &&
    currentQuantity >= item.maxQuantity
  ) {
    throw new SelectionLimitReachedError(item.maxQuantity);
  }

  const legacyQuantity = getLegacyQuantity(item, currentSelections);
  const selections = await incrementItemSelection(item.id, item, {
    effectiveMaxQuantity:
      item.selectionType === "limited" && typeof item.maxQuantity === "number"
        ? Math.max(0, item.maxQuantity - legacyQuantity)
        : undefined,
  });

  return buildRegistryResponse(selections);
}

export async function releaseItem(itemId) {
  const giftItemsById = await readGiftItemsById();
  const item = readItem(itemId, giftItemsById);
  const currentSelections = await readSelections();
  const selectionIdToRelease = getSelectionIdToRelease(item, currentSelections) || item.id;

  const selections = await decrementItemSelection(selectionIdToRelease);
  return buildRegistryResponse(selections);
}

export function getRegistryErrorResponse(error) {
  if (
    error instanceof InvalidItemError ||
    error instanceof ItemUnavailableError ||
    error instanceof SelectionLimitReachedError ||
    error instanceof SelectionEmptyError ||
    error instanceof StorageNotConfiguredError
  ) {
    return {
      statusCode: error.statusCode,
      body: { message: error.message },
    };
  }

  return {
    statusCode: 500,
    body: { message: "Nao foi possivel processar a solicitacao." },
  };
}
