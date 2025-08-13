"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ConditionsGeneralesPage() {
  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </motion.div>

        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/5">
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              Conditions Générales{" "}
              <span className="text-primary">d'Utilisation</span>
            </h1>

            <div className="prose prose-invert max-w-none">
              <p className="text-gray-400 mb-8 text-center">
                Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-primary mb-4">
                  1. Objet
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Les présentes conditions générales d'utilisation (CGU)
                  régissent l'utilisation du service de transport avec chauffeur
                  privé proposé par Breizh Travel VTC. En utilisant nos
                  services, vous acceptez pleinement et sans réserve les
                  présentes conditions.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-primary mb-4">
                  2. Services proposés
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Breizh Travel VTC propose des services de transport de
                  personnes avec chauffeur privé, notamment :
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>Transferts aéroport et gare</li>
                  <li>Transport pour événements privés et professionnels</li>
                  <li>Mise à disposition avec chauffeur</li>
                  <li>Visites touristiques</li>
                  <li>Transport de courtoisie</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-primary mb-4">
                  3. Réservations
                </h2>
                <div className="space-y-4 text-gray-300">
                  <p>
                    <strong>3.1 Modalités de réservation :</strong> Les
                    réservations peuvent être effectuées en ligne via notre site
                    web ou par téléphone. Toute réservation doit être confirmée
                    par un paiement.
                  </p>
                  <p>
                    <strong>3.2 Confirmation :</strong> Une confirmation de
                    réservation vous sera envoyée par email avec tous les
                    détails de votre trajet.
                  </p>
                  <p>
                    <strong>3.3 Modifications :</strong> Toute modification de
                    réservation doit être communiquée au moins 24 heures avant
                    l'heure prévue du service.
                  </p>
                  <p>
                    <strong>3.4 Remboursement en cas de modification :</strong>{" "}
                    Toute modification ou annulation de réservation effectuée au
                    moins 24 heures avant l'heure prévue donnera droit à un
                    remboursement total. Pour les modifications ou annulations
                    faites entre 2 heures et 24 heures avant l'heure prévue, un
                    remboursement partiel de 50 % pourra être accordé. Pour
                    toute modification ou annulation effectuée moins de 2 heures
                    avant l'heure prévue, un remboursement de 30 % sera
                    possible. Passé ce délai, aucune modification ne sera
                    acceptée.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-primary mb-4">
                  4. Tarifs et paiement
                </h2>
                <div className="space-y-4 text-gray-300">
                  <p>
                    <strong>4.1 Tarification :</strong> Les tarifs sont calculés
                    en fonction de la distance, de l'heure de service et du type
                    de prestation demandée.
                  </p>
                  <p>
                    <strong>4.2 Paiement :</strong> Le paiement s'effectue en
                    ligne par carte bancaire via notre plateforme sécurisée
                    Stripe.
                  </p>
                  <p>
                    <strong>4.3 Facturation :</strong> Une facture vous sera
                    transmise par email après le service.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-primary mb-4">
                  5. Annulation
                </h2>
                <div className="space-y-4 text-gray-300">
                  <p>
                    <strong>5.1 Annulation client :</strong> Toute annulation
                    doit être effectuée au moins 2 heures avant l'heure prévue
                    pour être remboursée.
                  </p>
                  <p>
                    <strong>5.2 Annulation de notre part :</strong> En cas
                    d'annulation de notre part, vous serez intégralement
                    remboursé.
                  </p>
                  <p>
                    <strong>5.3 Cas de force majeure :</strong> Aucune partie ne
                    sera tenue responsable en cas de force majeure.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-primary mb-4">
                  6. Responsabilités
                </h2>
                <div className="space-y-4 text-gray-300">
                  <p>
                    <strong>6.1 Notre responsabilité :</strong> Nous nous
                    engageons à fournir un service de qualité avec des
                    chauffeurs professionnels et des véhicules entretenus.
                  </p>
                  <p>
                    <strong>6.2 Assurance :</strong> Nos véhicules sont assurés
                    conformément à la réglementation en vigueur.
                  </p>
                  <p>
                    <strong>6.3 Objets perdus :</strong> Nous ne sommes pas
                    responsables des objets oubliés dans nos véhicules, mais
                    nous nous efforçons de les retrouver.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-primary mb-4">
                  7. Protection des données
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Vos données personnelles sont traitées conformément à notre
                  politique de confidentialité et au RGPD. Elles sont utilisées
                  uniquement pour la gestion de votre réservation et
                  l'amélioration de nos services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-primary mb-4">
                  8. Droit applicable
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Les présentes CGU sont soumises au droit français. Tout litige
                  sera de la compétence exclusive des tribunaux français.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-primary mb-4">
                  9. Contact
                </h2>
                <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20">
                  <p className="text-gray-300 mb-4">
                    Pour toute question concernant ces conditions d'utilisation
                    :
                  </p>
                  <div className="space-y-2 text-gray-300">
                    <p>
                      <strong>Email :</strong>{" "}
                      <a
                        href="mailto:contact@breizhtravelvtc.fr"
                        className="text-primary hover:underline"
                      >
                        contact@breizhtravelvtc.fr
                      </a>
                    </p>
                    <p>
                      <strong>Téléphone :</strong>{" "}
                      <a
                        href="tel:+330604184121"
                        className="text-primary hover:underline"
                      >
                        +33 06 04 18 41 21
                      </a>
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
