"use client";

import type { ProvidersResponse } from "@/lib/api/schemas";
import { Badge } from "@/components/Badge";

export function ProviderSelect({
  providers,
  value,
  onChange,
  disabled = false,
}: {
  providers: ProvidersResponse | null;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const selected = providers?.status[value];
  const tone =
    selected?.status === "ok"
      ? "good"
      : selected?.status === "search_only"
        ? "warning"
        : "neutral";
  return (
    <div className="provider-field">
      <label htmlFor="provider">Fournisseur</label>
      <div className="provider-control">
        <select
          id="provider"
          name="provider"
          value={value}
          disabled={disabled || !providers}
          onChange={(event) => onChange(event.target.value)}
        >
          {(providers?.providers ?? []).map((provider) => (
            <option key={provider} value={provider}>
              {provider}
            </option>
          ))}
        </select>
        {selected && (
          <Badge tone={tone} title={`${selected.reason} — statut déclaratif`}>
            {selected.status === "search_only"
              ? "recherche seule"
              : selected.status}
          </Badge>
        )}
      </div>
      <span className="field-hint">
        Statut déclaratif, pas une vérification en direct.
      </span>
    </div>
  );
}
