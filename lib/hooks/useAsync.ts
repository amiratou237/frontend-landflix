"use client";

import { useCallback, useEffect, useState } from "react";

export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

export function useAsync<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  enabled = true,
): {
  state: AsyncState<T>;
  retry: () => void;
} {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<{
    attempt: number;
    operation: typeof operation;
    value: AsyncState<T>;
  } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    void operation(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted)
          setSettled({
            attempt,
            operation,
            value: { status: "success", data },
          });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setSettled({
            attempt,
            operation,
            value: {
              status: "error",
              message:
                error instanceof Error
                  ? error.message
                  : "Une erreur est survenue.",
            },
          });
      });
    return () => controller.abort();
  }, [attempt, enabled, operation]);

  const retry = useCallback(() => setAttempt((current) => current + 1), []);
  const state = !enabled
    ? { status: "idle" as const }
    : settled?.attempt === attempt && settled.operation === operation
      ? settled.value
      : { status: "loading" as const };
  return { state, retry };
}
