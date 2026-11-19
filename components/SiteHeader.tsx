import Link from "next/link";
import { Clapperboard } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Clapperboard size={18} strokeWidth={2.1} aria-hidden="true" />
          </span>
          <span>
            Streams <b>DL</b>
          </span>
        </Link>
        <nav aria-label="Navigation principale">
          <Link href="/">Recherche</Link>
          <Link href="/about">À propos</Link>
        </nav>
      </div>
    </header>
  );
}
