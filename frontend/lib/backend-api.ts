import "server-only";

export type BackendConfig = {
  baseUrl: URL;
  apiKey: string;
};

export function getBackendBaseUrl(): URL | null {
  const configured = process.env.BACKEND_API_URL;
  if (!configured) return null;
  try {
    const url = new URL(configured);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

export function getBackendConfig(): BackendConfig | null {
  const apiKey = process.env.BACKEND_API_KEY;
  const baseUrl = getBackendBaseUrl();
  return baseUrl && apiKey ? { baseUrl, apiKey } : null;
}

export function getMaxUploadMb() {
  const configured = Number.parseInt(process.env.MAX_UPLOAD_SIZE_MB ?? "20", 10);
  return Number.isInteger(configured) && configured > 0 ? configured : 20;
}

export function getExternalAiEnabled() {
  return process.env.ALLOW_EXTERNAL_AI === "true";
}

export async function backendRequest(path: string, init: RequestInit = {}) {
  const config = getBackendConfig();
  if (!config) throw new Error("Analysis service is not configured.");

  const url = new URL(path.replace(/^\//, ""), `${config.baseUrl.href.replace(/\/$/, "")}/`);
  const headers = new Headers(init.headers);
  headers.set("X-API-Key", config.apiKey);
  headers.set("Accept", "application/json");

  return fetch(url, {
    ...init,
    headers,
    cache: "no-store",
    signal: init.signal ?? AbortSignal.timeout(60_000),
  });
}

export async function backendPublicRequest(path: string, init: RequestInit = {}) {
  const baseUrl = getBackendBaseUrl();
  if (!baseUrl) throw new Error("Analysis service URL is not configured.");

  const url = new URL(path.replace(/^\//, ""), `${baseUrl.href.replace(/\/$/, "")}/`);
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  return fetch(url, { ...init, headers, cache: "no-store", signal: init.signal ?? AbortSignal.timeout(15_000) });
}

export function backendErrorResponse() {
  return Response.json({ error: "Analysis service is not configured." }, { status: 503 });
}

export async function relayJson(response: Response) {
  const body: unknown = await response.json().catch(() => ({ error: "Analysis service returned an unreadable response." }));
  return Response.json(body, { status: response.status, headers: { "Cache-Control": "no-store" } });
}
