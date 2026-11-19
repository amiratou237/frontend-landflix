import type { ReactNode } from "react";

export function ErrorState({
  title = "La recherche a échoué",
  children,
  action,
}: {
  title?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="state-panel state-panel--error" role="alert">
      <span className="state-mark" aria-hidden="true">
        !
      </span>
      <h2>{title}</h2>
      <p>{children}</p>
      {action}
    </section>
  );
}
