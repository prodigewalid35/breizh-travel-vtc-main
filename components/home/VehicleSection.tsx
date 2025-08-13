"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { setupScrollAnimation } from "@/lib/animations";

const vehicleImages = [
  "/images/vehicules/1.jpg",
  "/images/vehicules/2.jpeg",
  "/images/vehicules/3.png",
  "/images/vehicules/4.jpeg",
  "/images/vehicules/5.jpeg",
];

export default function VehicleSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const cleanup = setupScrollAnimation();
    return cleanup;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === vehicleImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    "Sellerie en cuir surpiqué & finitions haut de gamme",
    "Climatisation bi-zone ajustée à vos préférences",
    "Vitrage fumé pour une discrétion absolue",
    "Connexion Wi-Fi haut débit gratuite",
    "Rafraîchissements, journaux & chargeurs à bord",
    "Chauffeur professionnel et élégant",
  ];

  return (
    <section id="vehicle" className="section-padding bg-black">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Slider */}
          <div className="fade-in">
            <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-[2rem] led-glow">
              <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
                {vehicleImages.map((src, index) => (
                  <Image
                    key={src}
                    src={src}
                    alt={`Véhicule de luxe ${index + 1}`}
                    fill
                    style={{
                      objectFit: "cover",
                      objectPosition: "center 65%",
                      transition: "opacity 1s ease-in-out",
                      opacity: currentImageIndex === index ? 1 : 0,
                      zIndex: currentImageIndex === index ? 1 : 0,
                    }}
                    unoptimized
                    priority={index === 0}
                    className="rounded-[2rem]"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="fade-in" style={{ transitionDelay: "0.2s" }}>
            <span className="text-primary font-medium mb-2 block">
              Notre Véhicule Premium
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Un Véhicule d'Exception, Un Voyage Inoubliable
            </h2>
            <p className="text-gray-400 mb-8">
              Offrez-vous le luxe de voyager dans un véhicule haut de gamme,
              conçu pour offrir un confort sans égal. Que ce soit pour un
              déplacement professionnel ou une occasion spéciale, chaque détail
              a été pensé pour faire de votre trajet une véritable expérience de
              bien-être. Profitez d’un habitacle spacieux, d’un confort sonore
              optimal et d'une atmosphère élégante, le tout accompagné d'un
              service professionnel, discret et irréprochable.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="bg-primary/20 rounded-full p-1.5">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="#booking"
              className="group relative inline-flex items-center justify-center"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
              <span className="relative bg-black px-8 py-4 rounded-full text-base font-medium text-white transition-colors group-hover:bg-black/80">
                Réserver Maintenant
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
