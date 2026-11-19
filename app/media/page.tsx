import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MediaContent } from "@/components/MediaContent";
import { validateHttpUrl, validateProvider } from "@/lib/validators";

type SearchParams = Promise<{
  url?: string | string[];
  provider?: string | string[];
  title?: string | string[];
}>;

export default async function MediaPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const url =
    typeof params.url === "string"
      ? validateHttpUrl(params.url, "media_url")
      : { ok: false as const, message: "Lien source absent." };
  const provider =
    typeof params.provider === "string"
      ? validateProvider(params.provider)
      : { ok: false as const, message: "Fournisseur absent ou invalide." };
  const title =
    typeof params.title === "string" ? params.title : "Titre sélectionné";

  if (!url.ok || !provider.ok)
    return (
      <main className="page-shell page-shell--narrow">
        <section className="state-panel">
          <h1>Impossible d’ouvrir ce titre</h1>
          <p>
            {!url.ok
              ? url.message
              : !provider.ok
                ? provider.message
                : "Les informations sont incomplètes."}
          </p>
          <Link className="button button--primary" href="/">
            <ArrowLeft size={16} aria-hidden="true" />
            Retour à la recherche
          </Link>
        </section>
      </main>
    );

  return (
    <MediaContent
      mediaUrl={url.value}
      provider={provider.value}
      title={title}
    />
  );
}
