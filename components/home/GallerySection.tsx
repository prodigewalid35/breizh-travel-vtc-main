"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { setupScrollAnimation } from "@/lib/animations";
import { ArrowRight } from "lucide-react";

const galleryImages = [
  {
    url: "/images/destinations/st-malo.jpg",
    title: "Saint-Malo",
    description:
      "Saint-Malo, cité corsaire bretonne, séduit par ses remparts historiques, ses plages dorées et son ambiance maritime unique.",
    link: "https://www.tourismebretagne.com/destinations/les-10-destinations/cap-frehel-saint-malo-baie-du-mont-saint-michel/saint-malo/",
  },
  {
    url: "/images/destinations/mt-st-michel.jpg",
    title: "Le Mont-Saint-Michel",
    description:
      "Le Mont-Saint-Michel, merveille architecturale posée entre ciel et mer, fascine par sa beauté intemporelle et son atmosphère unique.",
    link: "https://www.tourismebretagne.com/destinations/les-10-destinations/cap-frehel-saint-malo-baie-du-mont-saint-michel/la-baie-du-mont-saint-michel/",
  },

  {
    url: "/images/destinations/paris.jpg",
    title: "Paris",
    description:
      "Paris, capitale de l’élégance et de la culture, séduit par ses monuments emblématiques, ses cafés animés et son charme intemporel.",
    link: "https://www.visitparisregion.com/fr",
  },
  {
    url: "/images/destinations/chambord.png",
    title: "Château de Chambord",
    description:
      "Joyau de la Renaissance française, le Château de Chambord séduit par son escalier à double révolution, son architecture audacieuse inspirée de Léonard de Vinci et son toit-sculpture hérissé de cheminées, le tout inscrit au cœur du plus vaste parc clos de murs d’Europe.",
    link: "https://www.chambord.org/",
  },

  {
    url: "/images/destinations/cancale.jpg",
    title: "Cancale",
    description:
      "Cancale, perle de la côte bretonne, séduit par son port pittoresque, ses huîtres réputées et ses superbes panoramas sur la baie.",
    link: "https://www.tourismebretagne.com/destinations/les-10-destinations/cap-frehel-saint-malo-baie-du-mont-saint-michel/cancale/",
  },
  {
    url: "/images/destinations/dinan.jpg",
    title: "Dinan",
    description:
      "Dinan, joyau médiéval de Bretagne, charme par ses remparts, ses ruelles pavées et son atmosphère authentique.",
    link: "https://www.tourismebretagne.com/destinations/les-10-destinations/cap-frehel-saint-malo-baie-du-mont-saint-michel/dinan/",
  },
];

export default function GallerySection() {
  useEffect(() => {
    const cleanup = setupScrollAnimation();
    return cleanup;
  }, []);

  return (
    <section id="gallery" className="section-padding bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 fade-in">
          <span className="inline-block text-primary font-medium mb-4 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm">
            Nos Destinations
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Voyagez avec{" "}
            <span className="text-primary">Confort et Élégance</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Découvrez les destinations que nous vous proposons en VTC. Que vous
            souhaitiez visiter des sites emblématiques, vous évader en bord de
            mer ou explorer des trésors historiques, nous vous accompagnons dans
            tous vos déplacements avec professionnalisme et raffinement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="group relative rounded-3xl fade-in led-glow overflow-hidden"
              style={{
                transitionDelay: `${0.1 * (index + 1)}s`,
                height: "400px",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
              <div className="absolute inset-0 rounded-3xl overflow-hidden">
                <Image
                  src={image.url}
                  alt={image.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110 rounded-3xl"
                  unoptimized
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-b-3xl">
                <h3 className="text-xl font-semibold mb-2">{image.title}</h3>
                <p className="text-gray-300">{image.description}</p>
                <Link
                  href={image.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="mt-4 inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                    En savoir plus
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
