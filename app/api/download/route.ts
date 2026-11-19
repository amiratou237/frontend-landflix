import {
  backendFailure,
  backendFetch,
  jsonResponse,
} from "@/lib/server/backend";
import { validateHttpUrl } from "@/lib/validators";

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
  const videoUrl = validateHttpUrl(
    (input as Record<string, unknown>).video_url,
    "video_url",
  );
  if (!videoUrl.ok)
    return Response.json({ detail: videoUrl.message }, { status: 422 });
  try {
    return await jsonResponse(
      await backendFetch("/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_url: videoUrl.value }),
        signal: request.signal,
      }),
    );
  } catch (error) {
    return backendFailure(error);
  }
}
