import {
  backendFailure,
  backendFetch,
  jsonResponse,
} from "@/lib/server/backend";
import { validateHttpUrl, validateProvider } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return Response.json({ detail: "JSON invalide" }, { status: 422 });
  }
  if (typeof input !== "object" || input === null)
    return Response.json({ detail: "Objet requis" }, { status: 422 });
  const body = input as Record<string, unknown>;
  const mediaUrl = validateHttpUrl(body.media_url, "media_url");
  const provider = body.provider_name;
  if (!mediaUrl.ok)
    return Response.json({ detail: mediaUrl.message }, { status: 422 });
  if (provider !== undefined && !validateProvider(provider).ok)
    return Response.json({ detail: "provider_name invalide" }, { status: 422 });
  try {
    return await jsonResponse(
      await backendFetch("/get-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          media_url: mediaUrl.value,
          ...(provider === undefined ? {} : { provider_name: provider }),
        }),
        signal: request.signal,
      }),
    );
  } catch (error) {
    return backendFailure(error);
  }
}
