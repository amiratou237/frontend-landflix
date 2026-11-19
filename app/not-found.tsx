import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <main className="page-shell page-shell--narrow">
      <section className="state-panel">
        <h1>Page introuvable</h1>
        <p>Le lien a peut-être expiré ou a été modifié.</p>
        <Link className="button button--primary" href="/">
          <ArrowLeft size={16} aria-hidden="true" />
          Retour à la recherche
        </Link>
      </section>
    </main>
  );
}
