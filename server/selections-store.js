import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "selections.json");

async function ensureStoreExists() {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(dataFile, "utf-8");
  } catch {
    await writeFile(dataFile, "{}\n", "utf-8");
  }
}

function normalizeSelections(raw) {
  const normalized = {};

  if (!raw || typeof raw !== "object") return normalized;

  for (const [itemId, value] of Object.entries(raw)) {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      normalized[itemId] = {
        quantity: Math.floor(value),
        updatedAt: new Date().toISOString(),
      };
      continue;
    }

    if (value && typeof value === "object") {
      if (typeof value.quantity === "number" && Number.isFinite(value.quantity) && value.quantity > 0) {
        normalized[itemId] = {
          quantity: Math.floor(value.quantity),
          updatedAt: value.updatedAt || value.selectedAt || new Date().toISOString(),
        };
        continue;
      }

      if (value.selectedAt) {
        normalized[itemId] = {
          quantity: 1,
          updatedAt: value.selectedAt,
        };
      }
    }
  }

  return normalized;
}

export async function readSelections() {
  await ensureStoreExists();
  const raw = await readFile(dataFile, "utf-8");

  try {
    return normalizeSelections(JSON.parse(raw));
  } catch {
    return {};
  }
}

async function writeSelections(selections) {
  await ensureStoreExists();
  await writeFile(dataFile, `${JSON.stringify(selections, null, 2)}\n`, "utf-8");
}

export async function incrementItemSelection(itemId) {
  const current = await readSelections();
  const quantity = current[itemId]?.quantity ?? 0;

  current[itemId] = {
    quantity: quantity + 1,
    updatedAt: new Date().toISOString(),
  };

  await writeSelections(current);
  return current;
}

export async function decrementItemSelection(itemId) {
  const current = await readSelections();
  const quantity = current[itemId]?.quantity ?? 0;

  if (quantity <= 1) {
    delete current[itemId];
  } else {
    current[itemId] = {
      quantity: quantity - 1,
      updatedAt: new Date().toISOString(),
    };
  }

  await writeSelections(current);
  return current;
}
