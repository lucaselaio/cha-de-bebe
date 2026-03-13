import { readGiftItemsById } from "../server/gifts-store.js";
import {
  decrementItemSelection,
  incrementItemSelection,
  readSelections,
} from "../server/selections-store.js";
import { buildRegistryResponse } from "../server/registry-response.js";

function readItemId(request) {
  return request.body?.itemId;
}

export default async function handler(request, response) {
  if (request.method === "GET") {
    const selections = await readSelections();
    return response.status(200).json(await buildRegistryResponse(selections));
  }

  if (request.method === "POST") {
    const itemId = readItemId(request);
    const giftItemsById = await readGiftItemsById();

    if (!itemId || !giftItemsById[itemId]) {
      return response.status(400).json({ message: "Item inválido." });
    }

    const item = giftItemsById[itemId];
    const currentSelections = await readSelections();
    const currentQuantity = currentSelections[itemId]?.quantity ?? 0;

    if (
      item.selectionType === "limited" &&
      typeof item.maxQuantity === "number" &&
      currentQuantity >= item.maxQuantity
    ) {
      return response.status(409).json({
        message: `Este item já atingiu o limite máximo de ${item.maxQuantity} unidade(s).`,
      });
    }

    const selections = await incrementItemSelection(itemId);
    return response.status(200).json(await buildRegistryResponse(selections));
  }

  if (request.method === "DELETE") {
    const itemId = readItemId(request);
    const giftItemsById = await readGiftItemsById();

    if (!itemId || !giftItemsById[itemId]) {
      return response.status(400).json({ message: "Item inválido." });
    }

    const currentSelections = await readSelections();
    const currentQuantity = currentSelections[itemId]?.quantity ?? 0;

    if (currentQuantity <= 0) {
      return response.status(409).json({
        message: "Este item ainda não possui unidades selecionadas.",
      });
    }

    const selections = await decrementItemSelection(itemId);
    return response.status(200).json(await buildRegistryResponse(selections));
  }

  response.setHeader("Allow", "GET, POST, DELETE");
  return response.status(405).json({ message: "Método não suportado." });
}
