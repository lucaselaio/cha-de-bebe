import { Redis } from "@upstash/redis";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "selections.json");
const isVercelRuntime = process.env.VERCEL === "1";
const redisSelectionsKey = "cha-de-bebe:selections:quantity";
const redisUpdatedAtKey = "cha-de-bebe:selections:updatedAt";

const redisIncrementScript = `
local selectionsKey = KEYS[1]
local updatedAtKey = KEYS[2]
local itemId = ARGV[1]
local updatedAt = ARGV[2]
local maxQuantity = tonumber(ARGV[3])
local currentQuantity = tonumber(redis.call("HGET", selectionsKey, itemId) or "0")

if maxQuantity >= 0 and currentQuantity >= maxQuantity then
  return { "LIMIT_REACHED", tostring(currentQuantity) }
end

local nextQuantity = redis.call("HINCRBY", selectionsKey, itemId, 1)
redis.call("HSET", updatedAtKey, itemId, updatedAt)

return { "OK", tostring(nextQuantity), updatedAt }
`;

const redisDecrementScript = `
local selectionsKey = KEYS[1]
local updatedAtKey = KEYS[2]
local itemId = ARGV[1]
local updatedAt = ARGV[2]
local currentQuantity = tonumber(redis.call("HGET", selectionsKey, itemId) or "0")

if currentQuantity <= 0 then
  return { "EMPTY_SELECTION", "0" }
end

if currentQuantity <= 1 then
  redis.call("HDEL", selectionsKey, itemId)
  redis.call("HDEL", updatedAtKey, itemId)
  return { "OK", "0", updatedAt }
end

local nextQuantity = redis.call("HINCRBY", selectionsKey, itemId, -1)
redis.call("HSET", updatedAtKey, itemId, updatedAt)

return { "OK", tostring(nextQuantity), updatedAt }
`;

export class SelectionLimitReachedError extends Error {
  constructor(maxQuantity) {
    super(`Este item já atingiu o limite máximo de ${maxQuantity} unidade(s).`);
    this.name = "SelectionLimitReachedError";
    this.statusCode = 409;
  }
}

export class SelectionEmptyError extends Error {
  constructor() {
    super("Este item ainda não possui unidades selecionadas.");
    this.name = "SelectionEmptyError";
    this.statusCode = 409;
  }
}

export class StorageNotConfiguredError extends Error {
  constructor() {
    super(
      "Armazenamento persistente não configurado. Conecte um banco Redis na Vercel ou defina UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN.",
    );
    this.name = "StorageNotConfiguredError";
    this.statusCode = 500;
  }
}

function getRedisCredentials() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  return { url, token };
}

function hasRedisConfig() {
  const { url, token } = getRedisCredentials();
  return Boolean(url && token);
}

function shouldUseRedis() {
  return hasRedisConfig();
}

function getRedisClient() {
  const { url, token } = getRedisCredentials();

  if (!url || !token) {
    throw new StorageNotConfiguredError();
  }

  if (!globalThis.__CHA_DE_BEBE_REDIS__) {
    globalThis.__CHA_DE_BEBE_REDIS__ = new Redis({ url, token });
  }

  return globalThis.__CHA_DE_BEBE_REDIS__;
}

function assertPersistentStorageAvailable() {
  if (isVercelRuntime && !shouldUseRedis()) {
    throw new StorageNotConfiguredError();
  }
}

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

function normalizeRedisSelections(quantities, updatedAts) {
  const normalized = {};

  for (const [itemId, rawQuantity] of Object.entries(quantities || {})) {
    const quantity = Number(rawQuantity);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      continue;
    }

    normalized[itemId] = {
      quantity: Math.floor(quantity),
      updatedAt: typeof updatedAts?.[itemId] === "string" ? updatedAts[itemId] : null,
    };
  }

  return normalized;
}

async function readSelectionsFromFile() {
  await ensureStoreExists();
  const raw = await readFile(dataFile, "utf-8");

  try {
    return normalizeSelections(JSON.parse(raw));
  } catch {
    return {};
  }
}

async function writeSelectionsToFile(selections) {
  await ensureStoreExists();
  await writeFile(dataFile, `${JSON.stringify(selections, null, 2)}\n`, "utf-8");
}

async function readSelectionsFromRedis() {
  const redis = getRedisClient();
  const [quantities, updatedAts] = await Promise.all([
    redis.hgetall(redisSelectionsKey),
    redis.hgetall(redisUpdatedAtKey),
  ]);

  return normalizeRedisSelections(quantities, updatedAts);
}

function createIncrementScript(redis) {
  if (!globalThis.__CHA_DE_BEBE_INCREMENT_SCRIPT__) {
    globalThis.__CHA_DE_BEBE_INCREMENT_SCRIPT__ = redis.createScript(redisIncrementScript);
  }

  return globalThis.__CHA_DE_BEBE_INCREMENT_SCRIPT__;
}

function createDecrementScript(redis) {
  if (!globalThis.__CHA_DE_BEBE_DECREMENT_SCRIPT__) {
    globalThis.__CHA_DE_BEBE_DECREMENT_SCRIPT__ = redis.createScript(redisDecrementScript);
  }

  return globalThis.__CHA_DE_BEBE_DECREMENT_SCRIPT__;
}

async function incrementItemSelectionInRedis(itemId, item) {
  const redis = getRedisClient();
  const script = createIncrementScript(redis);
  const updatedAt = new Date().toISOString();
  const maxQuantity =
    item.selectionType === "limited" && typeof item.maxQuantity === "number" ? item.maxQuantity : -1;
  const result = await script.exec(
    [redisSelectionsKey, redisUpdatedAtKey],
    [itemId, updatedAt, String(maxQuantity)],
  );

  if (!Array.isArray(result) || result[0] !== "OK") {
    if (Array.isArray(result) && result[0] === "LIMIT_REACHED") {
      throw new SelectionLimitReachedError(item.maxQuantity);
    }

    throw new Error("Nao foi possivel reservar o item.");
  }

  return readSelectionsFromRedis();
}

async function decrementItemSelectionInRedis(itemId) {
  const redis = getRedisClient();
  const script = createDecrementScript(redis);
  const updatedAt = new Date().toISOString();
  const result = await script.exec([redisSelectionsKey, redisUpdatedAtKey], [itemId, updatedAt]);

  if (!Array.isArray(result) || result[0] !== "OK") {
    if (Array.isArray(result) && result[0] === "EMPTY_SELECTION") {
      throw new SelectionEmptyError();
    }

    throw new Error("Nao foi possivel remover a reserva do item.");
  }

  return readSelectionsFromRedis();
}

async function incrementItemSelectionInFile(itemId, item) {
  const current = await readSelectionsFromFile();
  const quantity = current[itemId]?.quantity ?? 0;

  if (
    item.selectionType === "limited" &&
    typeof item.maxQuantity === "number" &&
    quantity >= item.maxQuantity
  ) {
    throw new SelectionLimitReachedError(item.maxQuantity);
  }

  current[itemId] = {
    quantity: quantity + 1,
    updatedAt: new Date().toISOString(),
  };

  await writeSelectionsToFile(current);
  return current;
}

async function decrementItemSelectionInFile(itemId) {
  const current = await readSelectionsFromFile();
  const quantity = current[itemId]?.quantity ?? 0;

  if (quantity <= 0) {
    throw new SelectionEmptyError();
  }

  if (quantity <= 1) {
    delete current[itemId];
  } else {
    current[itemId] = {
      quantity: quantity - 1,
      updatedAt: new Date().toISOString(),
    };
  }

  await writeSelectionsToFile(current);
  return current;
}

export async function readSelections() {
  assertPersistentStorageAvailable();

  if (shouldUseRedis()) {
    return readSelectionsFromRedis();
  }

  return readSelectionsFromFile();
}

export async function incrementItemSelection(itemId, item) {
  assertPersistentStorageAvailable();

  if (shouldUseRedis()) {
    return incrementItemSelectionInRedis(itemId, item);
  }

  return incrementItemSelectionInFile(itemId, item);
}

export async function decrementItemSelection(itemId) {
  assertPersistentStorageAvailable();

  if (shouldUseRedis()) {
    return decrementItemSelectionInRedis(itemId);
  }

  return decrementItemSelectionInFile(itemId);
}
