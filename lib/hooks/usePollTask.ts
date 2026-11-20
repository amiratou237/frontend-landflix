"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getResolveStatus, startResolve } from "@/lib/api/client";
import type { TaskStatus } from "@/lib/api/schemas";

export type ResolveState =
  | { status: "idle" }
  | { status: "starting" }
  | { status: "pending"; taskId: string }
  | { status: "done"; info: TaskStatus["info"] }
  | { status: "failed"; message: string }
  | { status: "not_found"; taskId: string }
  | { status: "error"; message: string };

export function usePollTask(videoUrl: string): {
  state: ResolveState;
  start: () => void;
  taskId: string | null;
} {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<ResolveState>({ status: "idle" });
  const taskIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (attempt === 0) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();
    let stopped = false;
    const poll = async (taskId: string): Promise<void> => {
      if (stopped || controller.signal.aborted || document.hidden) return;
      if (Date.now() - startedAt >= 120_000) {
        setState({
          status: "error",
          message: "La résolution dépasse deux minutes. Vous pouvez relancer.",
        });
        return;
      }
      const result = await getResolveStatus(taskId, controller.signal);
      if (stopped || controller.signal.aborted) return;
      if (!result.ok) {
        if (result.kind === "business" && result.code === "not_found")
          setState({ status: "not_found", taskId });
        else setState({ status: "error", message: result.message });
        return;
      }
      if (result.data.status === "done") {
        setState({ status: "done", info: result.data.info });
        return;
      }
      if (result.data.status === "failed") {
        setState({
          status: "failed",
          message: result.data.error ?? "La résolution a échoué.",
        });
        return;
      }
      setState({ status: "pending", taskId });
      if (!document.hidden) {
        timer = setTimeout(() => {
          timer = undefined;
          void poll(taskId);
        }, 2000);
      }
    };

    const onVisibility = (): void => {
      if (!document.hidden && taskIdRef.current && !timer && !stopped)
        void poll(taskIdRef.current);
      if (document.hidden && timer) {
        clearTimeout(timer);
        timer = undefined;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    void startResolve(videoUrl, controller.signal).then((result) => {
      if (stopped || controller.signal.aborted) return;
      if (!result.ok) {
        setState(
          result.kind === "business" && result.code === "not_found"
            ? { status: "not_found", taskId: "" }
            : { status: "error", message: result.message },
        );
        return;
      }
      taskIdRef.current = result.data.task_id;
      setState({ status: "pending", taskId: result.data.task_id });
      void poll(result.data.task_id);
    });

    return () => {
      stopped = true;
      controller.abort();
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [attempt, videoUrl]);

  const start = useCallback(() => {
    taskIdRef.current = null;
    setState({ status: "starting" });
    setAttempt((current) => current + 1);
  }, []);

  return { state, start, taskId: taskIdRef.current };
}
