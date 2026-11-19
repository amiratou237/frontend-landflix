"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/Button";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }
  return (
    <Button
      variant="secondary"
      onClick={() => void copy()}
      aria-label={copied ? "Lien copié" : "Copier le lien"}
    >
      {copied ? (
        <Check size={16} aria-hidden="true" />
      ) : (
        <Copy size={16} aria-hidden="true" />
      )}
      {copied ? "Copié" : "Copier le lien"}
    </Button>
  );
}
