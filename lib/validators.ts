const PROVIDER_PATTERN = /^[a-z0-9-]{1,50}$/;
const TASK_ID_PATTERN = /^[A-Za-z0-9-]{1,64}$/;

export type ValidationResult =
  { ok: true; value: string } | { ok: false; message: string };

export function validateQuery(value: unknown): ValidationResult {
  if (typeof value !== "string")
    return { ok: false, message: "query must be a string" };
  const query = value.trim();
  if (query.length < 1 || query.length > 200) {
    return {
      ok: false,
      message: "query must contain between 1 and 200 characters",
    };
  }
  return { ok: true, value: query };
}

export function validateProvider(value: unknown): ValidationResult {
  if (typeof value !== "string" || !PROVIDER_PATTERN.test(value)) {
    return {
      ok: false,
      message:
        "provider_name must match [a-z0-9-] and contain 1 to 50 characters",
    };
  }
  return { ok: true, value };
}

export function validateHttpUrl(
  value: unknown,
  field: "media_url" | "video_url",
): ValidationResult {
  if (typeof value !== "string")
    return { ok: false, message: `${field} must be a valid http(s) URL` };
  try {
    const url = new URL(value);
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      !url.hostname
    ) {
      return { ok: false, message: `${field} must be a valid http(s) URL` };
    }
    if (field === "video_url" && !value.toLowerCase().includes("uqload")) {
      return { ok: false, message: "video_url must contain uqload" };
    }
    return { ok: true, value: url.toString() };
  } catch {
    return { ok: false, message: `${field} must be a valid http(s) URL` };
  }
}

export function validateTaskId(value: unknown): ValidationResult {
  if (typeof value !== "string" || !TASK_ID_PATTERN.test(value)) {
    return {
      ok: false,
      message: "task_id must match [A-Za-z0-9-] and contain 1 to 64 characters",
    };
  }
  return { ok: true, value };
}
