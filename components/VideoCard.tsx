/* eslint @next/next/no-img-element: off */

import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/Badge";
import { CopyButton } from "@/components/CopyButton";
import { ResolveTask } from "@/components/ResolveTask";
import type { UqVideo } from "@/lib/api/schemas";
import { formatBytes, formatDuration } from "@/lib/format";

const imageFallback =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'%3E%3Crect width='320' height='180' fill='%23dce2da'/%3E%3Cpath d='M138 65h44v50h-44zM148 77l27 13-27 14z' fill='%23354d45'/%3E%3C/svg%3E";

export function VideoCard({ video, index }: { video: UqVideo; index: number }) {
  const canResolve = video.html_url.toLowerCase().includes("uqload");
  const copyValue = video.url ?? video.html_url;
  return (
    <article className="video-row">
      <div className="video-thumb">
        {video.image_url ? (
          <img
            src={video.image_url}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(event) => {
              event.currentTarget.src = imageFallback;
            }}
          />
        ) : (
          <img src={imageFallback} alt="" loading="lazy" />
        )}
      </div>
      <div className="video-main">
        <div className="video-heading">
          <span className="video-index">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h2>{video.title ?? "Vidéo sans titre"}</h2>
        </div>
        <div className="video-meta">
          {video.resolution && <Badge>{video.resolution}</Badge>}
          {video.type && <Badge>{video.type}</Badge>}
          <span>{formatDuration(video.duration)}</span>
          <span>{formatBytes(video.size_in_bytes)}</span>
        </div>
        <div className="video-actions">
          <a
            className="button button--primary"
            href={video.html_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={16} aria-hidden="true" />
            Ouvrir le lecteur
          </a>
          {video.url && (
            <a
              className="button button--secondary"
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={16} aria-hidden="true" />
              Ouvrir le lien direct
            </a>
          )}
          <CopyButton value={copyValue} />
          {canResolve && <ResolveTask videoUrl={video.html_url} />}
        </div>
      </div>
    </article>
  );
}
