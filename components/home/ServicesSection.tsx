"use client";

import { useEffect } from "react";
import { Clock, Plane, Calendar, Car, MapPin, UserRound } from "lucide-react";
import { setupScrollAnimation } from "@/lib/animations";
import Image from "next/image";

export default function ServicesSection() {
  useEffect(() => {
    const cleanup = setupScrollAnimation();
    return cleanup;
  }, []);

  const services = [
    {
      icon: <Plane className="h-6 w-6" />,
      title: "Transferts Aéroport / Gare",
      description:
        "Voyagez en toute tranquillité grâce à un service de transfert ponctuel, fiable et confortable, vers ou depuis les principales gares et aéroports.",
      image: "/images/services/transferts.jpeg",
    },
    {
      icon: <UserRound className="h-6 w-6" />,
      title: "Chauffeur Privé",
      description:
        "Déplacez-vous avec élégance pour vos rendez-vous personnels ou professionnels grâce à un service discret, flexible et haut de gamme.",
      image: "/images/services/chauffeurs.jpg",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Mise à Disposition",
      description:
        "Profitez d'un chauffeur privé disponible pour plusieurs heures ou une journée complète, idéal pour une gestion flexible de vos déplacements multiples.",
      image: "/images/services/disposition.jpeg",
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Événements d'Entreprise",
      description:
        "Garantissez l'arrivée ponctuelle et distinguée de vos collaborateurs ou invités lors de vos séminaires, conférences ou événements professionnels.",
      image: "/images/services/evenements.jpg",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Visites Privées",
      description:
        "Explorez les trésors connus et secrets de la ville avec un chauffeur local, pour une expérience sur mesure, confortable et enrichissante.",
      image: "/images/services/voyage.jpeg",
    },
    {
      icon: <Car className="h-6 w-6" />,
      title: "Événements Privés",
      description:
        "Célébrez vos moments importants — mariages, anniversaires, soirées — avec un transport élégant, sécurisé et parfaitement orchestré.",
      image: "/images/services/events.jpeg",
    },
    {
      icon: <UserRound className="h-6 w-6" />,
      title: "Accompagnement Dédié",
      description:
        "Service attentionné et sécurisé pour enfants, seniors ou personnes à mobilité réduite, incluant un accompagnement personnalisé de porte à porte.",
      image: "/images/services/accompagnements.jpg",
    },
  ];

  return (
    <section
      id="services"
      className="section-padding bg-gradient-to-b from-[#0A0A0A] to-black"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Nos <span className="text-primary">Services Premium</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Découvrez une palette de services de transport sur mesure, alliant
            confort, sécurité et excellence. Chaque prestation est pensée pour
            répondre avec précision à vos attentes, dans un esprit de
            discrétion, de ponctualité et de sérénité.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group led-glow bg-card rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg fade-in"
              style={{
                transitionDelay: `${0.1 * (index + 1)}s`,
                background: `linear-gradient(145deg, rgba(0,115,255,0.1), rgba(0,0,0,0.95))`,
              }}
            >
              {/* Image Section */}
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  unoptimized
                />
                <div className="absolute top-4 left-4 z-20">
                  <div className="bg-primary/20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center text-primary">
                    {service.icon}
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-white">
                  {service.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
