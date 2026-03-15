import {
  getRegistryErrorResponse,
  getRegistryResponse,
  releaseItem,
  reserveItem,
} from "../server/registry-service.js";

function readItemId(request) {
  return request.body?.itemId;
}

export default async function handler(request, response) {
  try {
    if (request.method === "GET") {
      return response.status(200).json(await getRegistryResponse());
    }

    if (request.method === "POST") {
      return response.status(200).json(await reserveItem(readItemId(request)));
    }

    if (request.method === "DELETE") {
      return response.status(200).json(await releaseItem(readItemId(request)));
    }

    response.setHeader("Allow", "GET, POST, DELETE");
    return response.status(405).json({ message: "Método não suportado." });
  } catch (error) {
    const { statusCode, body } = getRegistryErrorResponse(error);
    return response.status(statusCode).json(body);
  }
}
