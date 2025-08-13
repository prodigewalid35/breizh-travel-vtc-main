import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import PageTransition from "@/components/ui/page-transition";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Breizh Travel VTC - Chauffeur Privé Premium",
  description: "Service de chauffeur privé haut de gamme en Bretagne",
  // AJOUT DE LA CONFIGURATION POUR LE FAVICON
  icons: {
    icon: "/favicon.ico", // Assurez-vous d'avoir "logo.png" dans votre dossier "public"
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // La langue a été corrigée en "fr" pour le référencement et l'accessibilité
    <html lang="fr">
      <body className={inter.className}>
        <PageTransition>{children}</PageTransition>
        <Toaster />
      </body>
    </html>
  );
}
