"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/Badge";
import { getLatestRelease, getProviders } from "@/lib/api/client";
import type { ProvidersResponse } from "@/lib/api/schemas";

export default function AboutPage() {
  const [providers, setProviders] = useState<ProvidersResponse | null>(null);
  const [release, setRelease] = useState("Version inconnue");
  const [reachable, setReachable] = useState<boolean | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load(): Promise<void> {
      const providerResult = await getProviders(controller.signal);
      if (controller.signal.aborted) return;
      setReachable(providerResult.ok);
      if (providerResult.ok) setProviders(providerResult.data);
      const releaseResult = await getLatestRelease(controller.signal);
      if (controller.signal.aborted) return;
      if (
        releaseResult.ok &&
        releaseResult.data.latest_release_version !== "unknown"
      )
        setRelease(releaseResult.data.latest_release_version);
    }
    void load();
    return () => controller.abort();
  }, []);

  return (
    <main className="page-shell page-shell--narrow">
      <section className="about-heading">
        <h1>À propos de Streams DL</h1>
        <p>
          Recherche de catalogues, extraction de liens et actualisation des
          informations vidéo.
        </p>
      </section>
      <section className="about-version" aria-live="polite">
        <span>Version</span>
        <strong>{release}</strong>
        <Badge
          tone={
            reachable === true
              ? "good"
              : reachable === false
                ? "danger"
                : "neutral"
          }
        >
          {reachable === true
            ? "Backend joignable"
            : reachable === false
              ? "Backend indisponible"
              : "Vérification…"}
        </Badge>
      </section>
      <section className="provider-table-section">
        <div className="section-title">
          <h2>Fournisseurs</h2>
          <p>Le statut est déclaratif, pas une vérification en direct.</p>
        </div>
        {providers ? (
          <div className="provider-table-wrap">
            <table className="provider-table">
              <thead>
                <tr>
                  <th scope="col">Nom</th>
                  <th scope="col">Adresse</th>
                  <th scope="col">Statut</th>
                  <th scope="col">Détail</th>
                </tr>
              </thead>
              <tbody>
                {providers.providers.map((name) => {
                  const item = providers.status[name];
                  return (
                    <tr key={name}>
                      <th scope="row">{name}</th>
                      <td>
                        <a
                          href={item?.base_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item?.base_url ?? "Inconnue"}
                        </a>
                      </td>
                      <td>
                        <Badge
                          tone={
                            item?.status === "ok"
                              ? "good"
                              : item?.status === "search_only"
                                ? "warning"
                                : "neutral"
                          }
                        >
                          {item?.status ?? "inconnu"}
                        </Badge>
                      </td>
                      <td>{item?.reason ?? "Aucun détail fourni."}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : reachable === false ? (
          <p className="table-fallback">
            Impossible de charger les fournisseurs pour le moment.
          </p>
        ) : (
          <p className="table-fallback">Chargement des fournisseurs…</p>
        )}
      </section>
      <p className="about-note">
        Les tâches d’actualisation sont conservées en mémoire par le backend.
        Elles disparaissent si celui-ci redémarre.
      </p>
    </main>
  );
}
