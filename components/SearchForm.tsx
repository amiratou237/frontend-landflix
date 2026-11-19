"use client";

import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/Button";
import { ProviderSelect } from "@/components/ProviderSelect";
import type { ProvidersResponse } from "@/lib/api/schemas";

export function SearchForm({
  providers,
  initialProvider,
  initialQuery,
  onSubmit,
  busy,
}: {
  providers: ProvidersResponse | null;
  initialProvider: string;
  initialQuery: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  busy: boolean;
}) {
  const [provider, setProvider] = useState(initialProvider);
  const [query, setQuery] = useState(initialQuery);
  return (
    <form className="search-form" onSubmit={onSubmit}>
      <ProviderSelect
        providers={providers}
        value={provider}
        onChange={setProvider}
        disabled={busy}
      />
      <div className="query-field">
        <label htmlFor="query">Film ou série</label>
        <input
          id="query"
          name="query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ex. Le fabuleux destin d’Amélie Poulain"
          maxLength={200}
          required
          disabled={busy}
        />
      </div>
      <Button type="submit" disabled={busy || !providers}>
        <Search size={18} aria-hidden="true" />
        {busy ? "Recherche…" : "Rechercher"}
      </Button>
    </form>
  );
}
