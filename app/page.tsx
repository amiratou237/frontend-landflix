"use client";

import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Info, SearchX } from "lucide-react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { MediaCard } from "@/components/MediaCard";
import { SearchForm } from "@/components/SearchForm";
import { Skeleton } from "@/components/Skeleton";
import { getProviders, search, type ApiResult } from "@/lib/api/client";
import type { Media, ProvidersResponse } from "@/lib/api/schemas";

type SearchState =
  | { status: "idle" | "cancelled" }
  | { status: "success"; results: Media[] }
  | { status: "error"; result: Extract<ApiResult<Media[]>, { ok: false }> };

function SearchPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const urlQuery = params.get("q") ?? "";
  const urlProvider = params.get("provider");
  const [providers, setProviders] = useState<ProvidersResponse | null>(null);
  const [providerError, setProviderError] = useState<string | null>(null);
  const [record, setRecord] = useState<{
    key: string;
    value: SearchState;
  } | null>(null);
  const [slowKey, setSlowKey] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const controllerRef = useRef<AbortController | null>(null);
  const provider = providers
    ? urlProvider && providers.providers.includes(urlProvider)
      ? urlProvider
      : providers.default
    : "";
  const searchKey = `${urlQuery}\u0000${provider}\u0000${attempt}`;
  const state: SearchState =
    record?.key === searchKey ? record.value : { status: "idle" };
  const loading = Boolean(
    urlQuery.trim() &&
    providers &&
    state.status === "idle" &&
    record?.key !== searchKey,
  );
  const slow = slowKey === searchKey;

  useEffect(() => {
    const controller = new AbortController();
    void getProviders(controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (!result.ok) {
        setProviderError(result.message);
        return;
      }
      setProviders(result.data);
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!providers || !urlQuery.trim() || providerError) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    const slowTimer = window.setTimeout(() => setSlowKey(searchKey), 3000);
    void search(urlQuery.trim(), provider, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      setRecord({
        key: searchKey,
        value: result.ok
          ? { status: "success", results: result.data }
          : { status: "error", result },
      });
    });
    return () => {
      controller.abort();
      window.clearTimeout(slowTimer);
    };
  }, [providers, providerError, provider, urlQuery, searchKey]);

  function submitSearch(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const trimmed = String(formData.get("query") ?? "").trim();
    const selectedProvider = String(formData.get("provider") ?? "");
    if (!trimmed || !selectedProvider) return;
    const next = `/?q=${encodeURIComponent(trimmed)}&provider=${encodeURIComponent(selectedProvider)}`;
    const current = `/?${params.toString()}`;
    if (next === current) setAttempt((value) => value + 1);
    else router.push(next);
  }

  function tryProvider(nextProvider: string): void {
    const next = `/?q=${encodeURIComponent(urlQuery.trim())}&provider=${encodeURIComponent(nextProvider)}`;
    router.push(next);
  }

  function cancelSearch(): void {
    controllerRef.current?.abort();
    setRecord({ key: searchKey, value: { status: "cancelled" } });
  }

  const retry = (): void => setAttempt((value) => value + 1);

  return (
    <main className="page-shell">
      <section className="search-intro">
        <div className="intro-copy">
          <h1>À l’affiche</h1>
          <p>
            Un titre, trois catalogues. Retrouvez les liens vidéo disponibles.
          </p>
        </div>
        <div className="intro-note">
          <span className="note-icon">
            <Info size={17} aria-hidden="true" />
          </span>
          <span>
            Le scraping prend parfois une minute. La recherche démarre
            uniquement à la validation.
          </span>
        </div>
      </section>

      <section
        className="search-panel"
        aria-label="Recherche de films et séries"
      >
        <div className="panel-heading">
          <h2>Rechercher un titre</h2>
          <span>Jusqu’à 50 résultats</span>
        </div>
        <SearchForm
          key={`${urlQuery}:${urlProvider ?? ""}:${provider}`}
          providers={providers}
          initialProvider={provider}
          initialQuery={urlQuery}
          onSubmit={submitSearch}
          busy={loading}
        />
        {providerError && (
          <ErrorState title="Fournisseurs indisponibles">
            {providerError}
          </ErrorState>
        )}
      </section>

      <section
        className="results-section"
        aria-live="polite"
        aria-busy={loading}
      >
        {state.status === "idle" && loading && (
          <>
            <div className="results-heading">
              <h2>Recherche en cours</h2>
              <Badge tone="warning">{provider}</Badge>
            </div>
            <Skeleton />
            {slow && (
              <div className="slow-message">
                <p>Le scraping peut prendre jusqu’à une minute…</p>
                <Button variant="secondary" onClick={cancelSearch}>
                  Annuler
                </Button>
              </div>
            )}
          </>
        )}
        {((state.status === "idle" && !loading) ||
          state.status === "cancelled") &&
          !providerError && (
            <div className="welcome-state">
              <span className="welcome-icon">
                <SearchX size={22} aria-hidden="true" />
              </span>
              <div>
                <h2>
                  {state.status === "cancelled"
                    ? "Recherche annulée."
                    : "Commencez par rechercher un titre."}
                </h2>
                <p>
                  {state.status === "cancelled"
                    ? "Vous pouvez lancer une nouvelle recherche."
                    : "Choisissez un catalogue, puis indiquez le titre à rechercher."}
                </p>
              </div>
            </div>
          )}
        {state.status === "success" && state.results.length > 0 && (
          <>
            <div className="results-heading">
              <h2>
                {state.results.length} résultat
                {state.results.length > 1 ? "s" : ""}
              </h2>
              <Badge>{provider}</Badge>
            </div>
            <div className="results-grid">
              {state.results.map((media, index) => (
                <MediaCard
                  key={`${media.url ?? media.title}-${index}`}
                  media={media}
                  provider={provider}
                />
              ))}
            </div>
          </>
        )}
        {state.status === "success" && state.results.length === 0 && (
          <EmptyState title="Aucun titre trouvé">
            Aucun résultat pour « {urlQuery} ». Le site distant ou ses
            sélecteurs ont peut-être changé.
            <div className="alternate-providers">
              {providers?.providers
                .filter((item) => item !== provider)
                .map((item) => (
                  <Button
                    key={item}
                    variant="secondary"
                    onClick={() => tryProvider(item)}
                  >
                    Essayer {item}
                    <ArrowRight size={15} aria-hidden="true" />
                  </Button>
                ))}
            </div>
          </EmptyState>
        )}
        {state.status === "error" && (
          <ErrorState
            title={
              state.result.kind === "network"
                ? "Backend inaccessible"
                : state.result.kind === "timeout"
                  ? "La recherche prend trop de temps"
                  : "La recherche a échoué"
            }
          >
            {state.result.message}
            <div className="error-actions">
              <Button variant="secondary" onClick={retry}>
                Réessayer
              </Button>
            </div>
          </ErrorState>
        )}
      </section>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <main className="page-shell">
          <Skeleton />
        </main>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
