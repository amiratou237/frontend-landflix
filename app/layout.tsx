import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Streams DL — Recherche de films et séries",
  description:
    "Recherchez un titre, explorez les liens vidéo disponibles et actualisez leurs informations.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <SiteHeader />
        {children}
        <footer className="site-footer">
          <span>Streams DL</span>
          <span>Recherche personnelle de catalogues vidéo</span>
        </footer>
      </body>
    </html>
  );
}
