import "server-only";

export class BackendTimeoutError extends Error {
  constructor() {
    super("Backend request timed out");
    this.name = "BackendTimeoutError";
  }
}

export class BackendUnreachableError extends Error {
  constructor() {
    super("Backend is unreachable");
    this.name = "BackendUnreachableError";
  }
}

export async function backendFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const baseUrl = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";
  const timeoutMs = Number(process.env.BACKEND_TIMEOUT_MS ?? "120000");
  let response: Response;
  try {
    response = await fetch(new URL(path, `${baseUrl.replace(/\/$/, "")}/`), {
      ...init,
      cache: "no-store",
      signal: init.signal
        ? AbortSignal.any([
            init.signal,
            AbortSignal.timeout(
              Number.isFinite(timeoutMs) ? timeoutMs : 120000,
            ),
          ])
        : AbortSignal.timeout(Number.isFinite(timeoutMs) ? timeoutMs : 120000),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError")
      throw new BackendTimeoutError();
    throw new BackendUnreachableError();
  }
  return response;
}

export async function jsonResponse(response: Response): Promise<Response> {
  try {
    const body: unknown = await response.json();
    return Response.json(body, { status: response.status });
  } catch {
    return Response.json(
      { error: "invalid_backend_response" },
      { status: response.status },
    );
  }
}

export function backendFailure(error: unknown): Response {
  if (error instanceof BackendTimeoutError) {
    return Response.json({ error: "backend_timeout" }, { status: 504 });
  }
  return Response.json({ error: "backend_unreachable" }, { status: 502 });
}
