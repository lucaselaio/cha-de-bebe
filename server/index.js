import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readGiftItems, readGiftItemsById } from "./gifts-store.js";
import {
  decrementItemSelection,
  incrementItemSelection,
  readSelections,
} from "./selections-store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || (process.env.NODE_ENV === "production" ? 3000 : 3001));

app.use(express.json());

function sortByUpdatedAtDesc(items) {
  return [...items].sort((a, b) => {
    const first = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const second = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return second - first;
  });
}

async function buildResponse(selections) {
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

app.get("/api/selections", async (_request, response) => {
  const selections = await readSelections();
  response.json(await buildResponse(selections));
});

app.post("/api/selections", async (request, response) => {
  const itemId = request.body?.itemId;
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
  return response.json(await buildResponse(selections));
});

app.delete("/api/selections", async (request, response) => {
  const itemId = request.body?.itemId;
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
  return response.json(await buildResponse(selections));
});

if (process.env.NODE_ENV === "production") {
  const distDir = path.resolve(__dirname, "../dist");

  app.use(express.static(distDir));
  app.get(/^(?!\/api).*/, (_request, response) => {
    response.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
