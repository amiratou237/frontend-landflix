import {
  backendFailure,
  backendFetch,
  jsonResponse,
} from "@/lib/server/backend";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  try {
    return await jsonResponse(
      await backendFetch("/providers", { signal: request.signal }),
    );
  } catch (error) {
    return backendFailure(error);
  }
}
