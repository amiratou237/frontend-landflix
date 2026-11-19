"use client";

import { RotateCw } from "lucide-react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Spinner } from "@/components/Spinner";
import { formatBytes, formatDuration } from "@/lib/format";
import { usePollTask } from "@/lib/hooks/usePollTask";

export function ResolveTask({ videoUrl }: { videoUrl: string }) {
  const { state, start } = usePollTask(videoUrl);
  if (state.status === "idle")
    return (
      <Button variant="quiet" onClick={start}>
        <RotateCw size={16} aria-hidden="true" />
        Actualiser les infos
      </Button>
    );
  if (state.status === "starting")
    return (
      <p className="resolve-status" aria-live="polite">
        <Spinner /> Démarrage de la résolution…
      </p>
    );
  if (state.status === "pending")
    return (
      <p className="resolve-status" aria-live="polite">
        <Spinner /> Actualisation en cours{" "}
        <span className="task-id">{state.taskId}</span>
      </p>
    );
  if (state.status === "done")
    return (
      <div className="resolve-result" aria-live="polite">
        <Badge tone="good">Informations actualisées</Badge>
        {state.info ? (
          <dl className="resolve-facts">
            {state.info.title && (
              <>
                <dt>Titre</dt>
                <dd>{state.info.title}</dd>
              </>
            )}
            {state.info.duration !== null && (
              <>
                <dt>Durée</dt>
                <dd>{formatDuration(state.info.duration)}</dd>
              </>
            )}
            {state.info.resolution && (
              <>
                <dt>Résolution</dt>
                <dd>{state.info.resolution}</dd>
              </>
            )}
            {state.info.size_in_bytes !== null && (
              <>
                <dt>Taille</dt>
                <dd>{formatBytes(state.info.size_in_bytes)}</dd>
              </>
            )}
          </dl>
        ) : (
          <p>Aucune information supplémentaire reçue.</p>
        )}
      </div>
    );
  if (state.status === "failed")
    return (
      <div className="resolve-error" role="alert">
        <p>{state.message}</p>
        <Button variant="quiet" onClick={start}>
          Relancer
        </Button>
      </div>
    );
  if (state.status === "not_found")
    return (
      <div className="resolve-error" role="alert">
        <p>Tâche introuvable (le serveur a peut-être redémarré).</p>
        <Button variant="quiet" onClick={start}>
          Relancer
        </Button>
      </div>
    );
  return (
    <div className="resolve-error" role="alert">
      <p>{state.message}</p>
      <Button variant="quiet" onClick={start}>
        Relancer
      </Button>
    </div>
  );
}
