import {
  backendFailure,
  backendFetch,
} from "@/lib/server/backend";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ taskId: string }> };

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { taskId } = await context.params;
  try {
    const response = await backendFetch(
      `/download-file/${encodeURIComponent(taskId)}`,
      { signal: _request.signal },
    );
    // Forward the streaming response with appropriate headers
    const headers = new Headers(response.headers);
    headers.set("Access-Control-Expose-Headers", "Content-Disposition");
    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    return backendFailure(error);
  }
}