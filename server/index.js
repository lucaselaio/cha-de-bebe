import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readGiftItemsById } from "./gifts-store.js";
import {
  decrementItemSelection,
  incrementItemSelection,
  readSelections,
} from "./selections-store.js";
import { buildRegistryResponse } from "./registry-response.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || (process.env.NODE_ENV === "production" ? 3000 : 3001));

app.use(express.json());

app.get("/api/selections", async (_request, response) => {
  const selections = await readSelections();
  response.json(await buildRegistryResponse(selections));
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
  return response.json(await buildRegistryResponse(selections));
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
  return response.json(await buildRegistryResponse(selections));
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
