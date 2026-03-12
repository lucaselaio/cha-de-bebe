async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || "Nao foi possivel concluir a acao.");
  }

  return payload;
}

export function fetchRegistry() {
  return requestJson("/api/selections", {
    cache: "no-store",
  });
}

export function updateRegistry(itemId, method) {
  return requestJson("/api/selections", {
    method,
    body: JSON.stringify({ itemId }),
  });
}
