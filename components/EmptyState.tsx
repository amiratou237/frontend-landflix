import type { ReactNode } from "react";

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="state-panel" aria-live="polite">
      <span className="state-mark" aria-hidden="true">
        —
      </span>
      <h2>{title}</h2>
      <p>{children}</p>
      {action}
    </section>
  );
}
