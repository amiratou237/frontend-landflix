import {
  backendFailure,
  backendFetch,
  jsonResponse,
} from "@/lib/server/backend";
import { validateProvider, validateQuery } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const query = validateQuery(params.get("query"));
  const provider = params.get("provider_name");
  if (!query.ok)
    return Response.json(
      {
        detail: [
          { loc: ["query", "query"], msg: query.message, type: "value_error" },
        ],
      },
      { status: 422 },
    );
  if (provider !== null && !validateProvider(provider).ok) {
    return Response.json(
      {
        detail: [
          {
            loc: ["query", "provider_name"],
            msg: "Invalid provider_name",
            type: "value_error",
          },
        ],
      },
      { status: 422 },
    );
  }
  const upstream = new URLSearchParams({ query: query.value });
  if (provider !== null) upstream.set("provider_name", provider);
  try {
    return await jsonResponse(
      await backendFetch(`/search?${upstream.toString()}`, {
        signal: request.signal,
      }),
    );
  } catch (error) {
    return backendFailure(error);
  }
}
