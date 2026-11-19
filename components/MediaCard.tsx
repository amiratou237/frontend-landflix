/* eslint @next/next/no-img-element: off */

import Link from "next/link";
import { ArrowUpRight, Film } from "lucide-react";
import { Badge } from "@/components/Badge";
import type { Media } from "@/lib/api/schemas";

const imageFallback =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'%3E%3Crect width='320' height='180' fill='%23dce2da'/%3E%3Cpath d='M138 65h44v50h-44zM148 77l27 13-27 14z' fill='%23354d45'/%3E%3C/svg%3E";

export function MediaCard({
  media,
  provider,
}: {
  media: Media;
  provider: string;
}) {
  const content = (
    <>
      <div className="media-art">
        {media.image_url ? (
          <img
            src={media.image_url}
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
        <span className="media-open" aria-hidden="true">
          {media.url ? <ArrowUpRight size={19} /> : <Film size={19} />}
        </span>
      </div>
      <div className="media-copy">
        <Badge tone="neutral">{provider}</Badge>
        <h3>{media.title}</h3>
        <span className="media-hint">
          {media.url ? "Voir les liens vidéo" : "Lien indisponible"}
        </span>
      </div>
    </>
  );
  return media.url ? (
    <Link
      className={`media-card media-card--provider-${provider}`}
      href={`/media?url=${encodeURIComponent(media.url)}&provider=${encodeURIComponent(provider)}&title=${encodeURIComponent(media.title)}`}
    >
      {content}
    </Link>
  ) : (
    <article className="media-card media-card--disabled">{content}</article>
  );
}
