"use client";

import { Button } from "@/components/Button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="page-shell page-shell--narrow">
      <section className="state-panel state-panel--error" role="alert">
        <h1>Une erreur est survenue</h1>
        <p>Cette page n’a pas pu se charger. Réessayez.</p>
        <Button onClick={reset}>Réessayer</Button>
      </section>
    </main>
  );
}
