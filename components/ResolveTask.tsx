"use client";

import { Download, RotateCw } from "lucide-react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Spinner } from "@/components/Spinner";
import { formatBytes, formatDuration } from "@/lib/format";
import { downloadFile } from "@/lib/api/client";
import { usePollTask } from "@/lib/hooks/usePollTask";

export function ResolveTask({ videoUrl }: { videoUrl: string }) {
  const { state, start, taskId } = usePollTask(videoUrl);
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
  if (state.status === "done") {
    const handleDownload = async () => {
      if (!taskId) return;
      try {
        const response = await downloadFile(taskId);
        if (!response.ok) {
          const blob = await response.blob();
          const text = await blob.text();
          console.error("Download failed", text);
          return;
        }
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        const contentDisposition = response.headers.get("Content-Disposition");
        const filenameMatch = contentDisposition?.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        const filename = filenameMatch
          ? filenameMatch[1].replace(/['"]/g, "")
          : "video.mp4";
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        console.error("Download error", error);
      }
    };
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
        <div className="resolve-actions">
          <Button variant="primary" onClick={handleDownload} disabled={!taskId}>
            <Download size={16} aria-hidden="true" />
            Télécharger
          </Button>
        </div>
      </div>
    );
  }
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
