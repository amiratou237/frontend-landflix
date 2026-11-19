"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, RotateCw } from "lucide-react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Skeleton } from "@/components/Skeleton";
import { VideoCard } from "@/components/VideoCard";
import { getVideos, type ApiResult } from "@/lib/api/client";
import type { UqVideo } from "@/lib/api/schemas";

type State =
  | { status: "success"; videos: UqVideo[] }
  | { status: "error"; result: Extract<ApiResult<UqVideo[]>, { ok: false }> };

export function MediaContent({
  mediaUrl,
  provider,
  title,
}: {
  mediaUrl: string;
  provider: string;
  title: string;
}) {
  const [attempt, setAttempt] = useState(0);
  const [record, setRecord] = useState<{
    attempt: number;
    value: State;
  } | null>(null);
  const state = record?.attempt === attempt ? record.value : null;

  useEffect(() => {
    const controller = new AbortController();
    void getVideos(mediaUrl, provider, controller.signal).then((result) => {
      if (!controller.signal.aborted)
        setRecord({
          attempt,
          value: result.ok
            ? { status: "success", videos: result.data }
            : { status: "error", result },
        });
    });
    return () => controller.abort();
  }, [attempt, mediaUrl, provider]);

  return (
    <main className="page-shell">
      <div className="media-topline">
        <Link href="/" className="back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          Retour à la recherche
        </Link>
        <Badge>{provider}</Badge>
      </div>
      <section className="media-header">
        <div>
          <h1>{title}</h1>
          <a
            className="source-link"
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Page source <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
        <p>Liens vidéo extraits de ce titre.</p>
      </section>
      <section className="video-list" aria-live="polite" aria-busy={!state}>
        {!state && (
          <>
            <div className="results-heading">
              <h2>Extraction des liens</h2>
              <Badge tone="warning">Cela peut prendre un moment</Badge>
            </div>
            <Skeleton count={3} />
          </>
        )}
        {state?.status === "success" && state.videos.length > 0 && (
          <>
            <div className="results-heading">
              <h2>
                {state.videos.length} lien{state.videos.length > 1 ? "s" : ""}{" "}
                trouvé{state.videos.length > 1 ? "s" : ""}
              </h2>
            </div>
            {state.videos.map((video, index) => (
              <VideoCard
                key={`${video.html_url}-${index}`}
                video={video}
                index={index}
              />
            ))}
          </>
        )}
        {state?.status === "success" && state.videos.length === 0 && (
          <EmptyState title="Aucun lien UQload trouvé">
            Le site a peut-être changé. Vous pouvez relancer l’extraction.
            <div className="error-actions">
              <Button
                variant="secondary"
                onClick={() => setAttempt((value) => value + 1)}
              >
                <RotateCw size={16} aria-hidden="true" />
                Réessayer
              </Button>
            </div>
          </EmptyState>
        )}
        {state?.status === "error" && (
          <ErrorState
            title={
              state.result.kind === "network"
                ? "Backend inaccessible"
                : state.result.kind === "timeout"
                  ? "L’extraction prend trop de temps"
                  : "Impossible d’extraire les liens"
            }
          >
            {state.result.message}
            <div className="error-actions">
              <Button
                variant="secondary"
                onClick={() => setAttempt((value) => value + 1)}
              >
                Réessayer
              </Button>
            </div>
          </ErrorState>
        )}
      </section>
    </main>
  );
}
