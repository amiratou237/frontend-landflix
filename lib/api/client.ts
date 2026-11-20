import {
  backendErrorSchema,
  providersSchema,
  releaseSchema,
  resolveAcceptedSchema,
  searchResponseSchema,
  taskStatusSchema,
  videosResponseSchema,
  type Media,
  type ProvidersResponse,
  type ResolveAccepted,
  type TaskStatus,
  type UqVideo,
} from "@/lib/api/schemas";

export type ApiResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      kind: "business";
      message: string;
      details?: unknown;
      code?: "not_found" | "rejected";
    }
  | {
      ok: false;
      kind:
        "validation" | "network" | "timeout" | "server" | "invalid_response";
      message: string;
      details?: unknown;
    };

function messageForStatus(status: number): string {
  if (status === 422) return "Les données envoyées ne sont pas valides.";
  if (status === 502) return "Le backend ne répond pas.";
  if (status === 504) return "Le backend a mis trop de temps à répondre.";
  if (status >= 500) return "Le serveur a rencontré une erreur.";
  return "La requête n’a pas abouti.";
}

export function normalizeApiResponse<T>(
  status: number,
  body: unknown,
  schema: {
    safeParse: (
      input: unknown,
    ) => { success: true; data: T } | { success: false; error: unknown };
  },
): ApiResult<T> {
  const businessError = backendErrorSchema.safeParse(body);
  if (
    status === 200 &&
    businessError.success &&
    (businessError.data.error ||
      businessError.data.status === "rejected" ||
      businessError.data.status === "not_found")
  ) {
    const code =
      businessError.data.status === "not_found"
        ? "not_found"
        : businessError.data.status === "rejected"
          ? "rejected"
          : undefined;
    return {
      ok: false,
      kind: "business",
      message: businessError.data.error,
      ...(code ? { code } : {}),
      details: body,
    };
  }

  if (
    status === 422 ||
    (![502, 504].includes(status) && status >= 400 && status < 500)
  ) {
    return {
      ok: false,
      kind: "validation",
      message: messageForStatus(status),
      details: body,
    };
  }
  if (status === 502)
    return {
      ok: false,
      kind: "network",
      message: messageForStatus(status),
      details: body,
    };
  if (status === 504)
    return {
      ok: false,
      kind: "timeout",
      message: messageForStatus(status),
      details: body,
    };
  if (status >= 500)
    return {
      ok: false,
      kind: "server",
      message: messageForStatus(status),
      details: body,
    };

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    if (process.env.NODE_ENV === "development")
      console.error("Réponse API invalide", parsed.error);
    return {
      ok: false,
      kind: "invalid_response",
      message: "Le backend a renvoyé des données inattendues.",
    };
  }
  return { ok: true, data: parsed.data };
}

async function request<T>(
  path: string,
  schema: {
    safeParse: (
      input: unknown,
    ) => { success: true; data: T } | { success: false; error: unknown };
  },
  init: RequestInit = {},
): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(path, { ...init, cache: "no-store" });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError")
    ) {
      return {
        ok: false,
        kind: "timeout",
        message: "La requête a été interrompue ou a dépassé le délai.",
      };
    }
    return {
      ok: false,
      kind: "network",
      message:
        "Impossible de joindre le frontend. Vérifiez qu’il est toujours actif.",
    };
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return {
      ok: false,
      kind: "invalid_response",
      message: "Le serveur a renvoyé une réponse illisible.",
    };
  }

  return normalizeApiResponse(response.status, body, schema);
}

function jsonPost(body: unknown, signal?: AbortSignal): RequestInit {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    ...(signal ? { signal } : {}),
  };
}

export function getProviders(
  signal?: AbortSignal,
): Promise<ApiResult<ProvidersResponse>> {
  return request("/api/providers", providersSchema, signal ? { signal } : {});
}

export function search(
  query: string,
  provider: string,
  signal?: AbortSignal,
): Promise<ApiResult<Media[]>> {
  const params = new URLSearchParams({ query, provider_name: provider });
  return request(
    `/api/search?${params.toString()}`,
    searchResponseSchema,
    signal ? { signal } : {},
  ).then((result) =>
    result.ok ? { ok: true, data: result.data.results } : result,
  );
}

export function getVideos(
  mediaUrl: string,
  provider: string,
  signal?: AbortSignal,
): Promise<ApiResult<UqVideo[]>> {
  return request(
    "/api/get-videos",
    videosResponseSchema,
    jsonPost({ media_url: mediaUrl, provider_name: provider }, signal),
  ).then((result) =>
    result.ok ? { ok: true, data: result.data.results } : result,
  );
}

export function startResolve(
  videoUrl: string,
  signal?: AbortSignal,
): Promise<ApiResult<ResolveAccepted>> {
  return request(
    "/api/download",
    resolveAcceptedSchema,
    jsonPost({ video_url: videoUrl }, signal),
  );
}

export function getResolveStatus(
  taskId: string,
  signal?: AbortSignal,
): Promise<ApiResult<TaskStatus>> {
  return request(
    `/api/download/${encodeURIComponent(taskId)}`,
    taskStatusSchema,
    signal ? { signal } : {},
  );
}

export function downloadFile(
  taskId: string,
  signal?: AbortSignal,
): Promise<Response> {
  return fetch(`/api/download/${encodeURIComponent(taskId)}/file`, {
    method: "GET",
    cache: "no-store",
    ...(signal ? { signal } : {}),
  });
}

export function getLatestRelease(
  signal?: AbortSignal,
): Promise<ApiResult<{ latest_release_version: string }>> {
  return request(
    "/api/latest-release",
    releaseSchema,
    signal ? { signal } : {},
  );
}
