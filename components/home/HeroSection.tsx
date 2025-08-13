"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
// La ligne d'importation peut rester, elle ne cause aucun problème.
import { setupScrollAnimation } from "@/lib/animations";

export default function HeroSection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // La ligne suivante, qui créait l'animation de la barre bleue, est maintenant désactivée.
    // const cleanup = setupScrollAnimation();

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      // La fonction de nettoyage correspondante est également désactivée.
      // cleanup();
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  return (
    <section id="home" className="relative h-screen flex items-center">
      <div className="absolute inset-0 bg-black/40 z-10"></div>

      {!isMobile && (
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source
              src="https://files.catbox.moe/g4rt13.mp4"
              type="video/mp4"
            />
          </video>
        </div>
      )}

      <div className="container mx-auto px-4 relative z-20">
        <div className="max-w-3xl">
          <span className="inline-block text-primary font-medium mb-4 px-6 py-2 rounded-full bg-[#0A1A2F] backdrop-blur-sm fade-in">
            Private Driver
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 fade-in leading-tight">
            Service de <br />
            <span className="text-[#3B82F6]">Chauffeur Privé</span> <br />
            Premium
          </h1>
          <p
            className="text-lg md:text-xl text-gray-300 mb-12 fade-in max-w-2xl"
            style={{ transitionDelay: "0.2s" }}
          >
            Découvrez le luxe éco-responsable avec nos chauffeurs professionnels
            et nos véhicules hybrides haut de gamme accessibles à tous.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 fade-in"
            style={{ transitionDelay: "0.4s" }}
          >
            <Link
              href="#booking"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full text-base font-medium bg-[#3B82F6] hover:bg-[#2563EB] transition-all duration-300 shadow-lg shadow-blue-500/30"
            >
              <span className="flex items-center gap-2">
                Réserver maintenant
                <ArrowRight className="h-5 w-5" />
              </span>
            </Link>
            <Link
              href="#services"
              className="px-8 py-4 rounded-full text-base font-medium transition-all duration-300 flex items-center justify-center bg-[#1E293B] hover:bg-[#2D3B4F]"
            >
              Nos services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
