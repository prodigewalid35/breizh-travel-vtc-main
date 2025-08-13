"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const NavLinks = [
  { name: "Accueil", href: "#home" },
  { name: "Services", href: "#services" },
  { name: "Destinations", href: "#gallery" },
  { name: "Véhicules", href: "#vehicle" },
  { name: "Réservation", href: "#booking" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("#home");
  const sectionsRef = useRef<Map<string, HTMLElement> | null>(null);

  const getSections = () => {
    if (!sectionsRef.current) {
      sectionsRef.current = new Map();
      NavLinks.forEach((link) => {
        const element = document.querySelector(link.href);
        if (element) {
          sectionsRef.current?.set(link.href, element as HTMLElement);
        }
      });
    }
    return sectionsRef.current;
  };

  // Effet pour le scroll-spy et le style de la navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = getSections();
      if (!sections) return;

      let currentActive = "#home";
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      sections.forEach((section, href) => {
        if (section.offsetTop <= scrollPosition) {
          currentActive = href;
        }
      });

      setActiveLink(currentActive);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []); // Dépendance vide pour la performance

  // Effet pour bloquer le scroll du body quand le menu est ouvert
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  // Effet pour fermer le menu avec la touche 'Echap'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Gestion du clic sur les liens de navigation
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    setIsMenuOpen(false); // Ferme le menu mobile au clic
    setActiveLink(href);

    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out",
          isScrolled
            ? "bg-black/60 backdrop-blur-lg py-3 shadow-xl shadow-primary/5 border-b border-white/10"
            : "bg-black/20 backdrop-blur-sm py-6"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="relative flex items-center justify-end">
            {/* Logo */}
            <Link
              href="#home"
              onClick={(e) => handleNavClick(e, "#home")}
              className="absolute left-0 lg:-ml-20 top-1/2 -translate-y-1/2 z-50 group"
              aria-label="Retour à l'accueil"
            >
              <img
                src="/images/navbar/logo.png"
                alt="Breizh Travel VTC Logo"
                className="h-14 w-auto transition-transform duration-300 group-hover:scale-110"
              />
            </Link>

            {/* Liens pour ordinateur */}
            <div className="hidden lg:flex items-center gap-1">
              {NavLinks.map((link, index) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full group",
                    activeLink === link.href
                      ? "text-white"
                      : "text-white/70 hover:text-white",
                    "before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/0 before:via-primary/10 before:to-primary/0",
                    "before:rounded-full before:opacity-0 before:transition-all before:duration-300",
                    "hover:before:opacity-100 hover:shadow-lg hover:shadow-primary/20",
                    "after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5",
                    "after:bg-gradient-to-r after:from-primary after:to-blue-400 after:transition-all after:duration-300",
                    activeLink === link.href
                      ? "after:w-3/4"
                      : "after:w-0 group-hover:after:w-3/4"
                  )}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <span className="relative z-10">{link.name}</span>
                </Link>
              ))}
              <Link
                href="#booking"
                onClick={(e) => handleNavClick(e, "#booking")}
                className="relative ml-4 group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-blue-500 to-primary rounded-full blur opacity-75 group-hover:opacity-100 transition-all duration-500 group-hover:blur-lg animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-primary to-blue-600 px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-primary/30">
                  <span className="flex items-center gap-2">
                    Réserver
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </span>
                </div>
              </Link>
            </div>

            {/* Bouton du menu mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative z-50 p-2 text-white lg:hidden"
              aria-label="Ouvrir le menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu-panel"
            >
              <div className="relative w-6 h-6">
                <span
                  className={cn(
                    "absolute block h-0.5 w-6 bg-white transform transition-all duration-300",
                    isMenuOpen ? "rotate-45 top-3" : "top-1"
                  )}
                />
                <span
                  className={cn(
                    "absolute block h-0.5 w-6 bg-white transform transition-all duration-300 top-3",
                    isMenuOpen ? "opacity-0" : "opacity-100"
                  )}
                />
                <span
                  className={cn(
                    "absolute block h-0.5 w-6 bg-white transform transition-all duration-300",
                    isMenuOpen ? "-rotate-45 top-3" : "top-5"
                  )}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Menu mobile complet avec fond flouté */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden",
          isMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        {/* Fond flouté (Backdrop) */}
        <div
          onClick={() => setIsMenuOpen(false)}
          className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500",
            isMenuOpen ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Panneau du menu qui glisse */}
        <div
          id="mobile-menu-panel"
          className={cn(
            "relative z-50 flex h-full w-4/5 max-w-xs flex-col bg-black/95 p-6 shadow-2xl transition-transform duration-500 ease-in-out",
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Le logo en double a été retiré d'ici */}

          <div className="flex flex-1 flex-col items-center justify-center gap-8">
            {NavLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={cn(
                  "group relative text-2xl font-medium transition-colors duration-300",
                  activeLink === link.href
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                )}
              >
                {link.name}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary to-blue-400 transition-all duration-300",
                    activeLink === link.href
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  )}
                />
              </Link>
            ))}
          </div>

          <div className="mt-auto text-center">
            <Link
              href="#booking"
              onClick={(e) => handleNavClick(e, "#booking")}
              className="relative inline-block group"
            >
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-primary via-blue-500 to-primary blur-lg opacity-75 transition-all duration-500 group-hover:opacity-100 animate-pulse"></div>
              <div className="relative rounded-2xl bg-gradient-to-r from-primary to-blue-600 px-8 py-4 text-lg font-semibold text-white transition-transform duration-300 group-hover:scale-105">
                Réserver maintenant
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
