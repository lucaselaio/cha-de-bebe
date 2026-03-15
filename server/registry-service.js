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
  const selections = await incrementItemSelection(itemId, item);

  return buildRegistryResponse(selections);
}

export async function releaseItem(itemId) {
  const giftItemsById = await readGiftItemsById();
  readItem(itemId, giftItemsById);

  const selections = await decrementItemSelection(itemId);
  return buildRegistryResponse(selections);
}

export function getRegistryErrorResponse(error) {
  if (
    error instanceof InvalidItemError ||
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
