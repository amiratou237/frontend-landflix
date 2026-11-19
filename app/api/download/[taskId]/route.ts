import {
  backendFailure,
  backendFetch,
  jsonResponse,
} from "@/lib/server/backend";
import { validateTaskId } from "@/lib/validators";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ taskId: string }> };

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { taskId } = await context.params;
  const validation = validateTaskId(taskId);
  if (!validation.ok)
    return Response.json({ detail: validation.message }, { status: 422 });
  try {
    return await jsonResponse(
      await backendFetch(`/download/${encodeURIComponent(validation.value)}`, {
        signal: _request.signal,
      }),
    );
  } catch (error) {
    return backendFailure(error);
  }
}
