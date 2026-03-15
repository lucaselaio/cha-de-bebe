import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getRegistryErrorResponse,
  getRegistryResponse,
  releaseItem,
  reserveItem,
} from "./registry-service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || (process.env.NODE_ENV === "production" ? 3000 : 3001));

app.use(express.json());

app.get("/api/selections", async (_request, response) => {
  try {
    response.json(await getRegistryResponse());
  } catch (error) {
    const { statusCode, body } = getRegistryErrorResponse(error);
    response.status(statusCode).json(body);
  }
});

app.post("/api/selections", async (request, response) => {
  try {
    return response.json(await reserveItem(request.body?.itemId));
  } catch (error) {
    const { statusCode, body } = getRegistryErrorResponse(error);
    return response.status(statusCode).json(body);
  }
});

app.delete("/api/selections", async (request, response) => {
  try {
    return response.json(await releaseItem(request.body?.itemId));
  } catch (error) {
    const { statusCode, body } = getRegistryErrorResponse(error);
    return response.status(statusCode).json(body);
  }
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
