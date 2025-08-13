"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PolitiqueConfidentialitePage() {
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
              Politique de <span className="text-primary">Confidentialité</span>
            </h1>

            <div className="prose prose-invert max-w-none">
              <p className="text-gray-400 mb-8 text-center">
                Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-primary mb-4">
                  1. Introduction
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Breizh Travel VTC s'engage à protéger votre vie privée et vos
                  données personnelles. Cette politique de confidentialité
                  explique comment nous collectons, utilisons, stockons et
                  protégeons vos informations personnelles conformément au
                  Règlement Général sur la Protection des Données (RGPD).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-primary mb-4">
                  2. Données collectées
                </h2>
                <div className="space-y-4 text-gray-300">
                  <p>
                    <strong>2.1 Données d'identification :</strong>
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Nom et prénom</li>
                    <li>Adresse email</li>
                    <li>Numéro de téléphone</li>
                  </ul>

                  <p>
                    <strong>2.2 Données de réservation :</strong>
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Adresses de départ et d'arrivée</li>
                    <li>Date et heure de service</li>
                    <li>Préférences de service</li>
                  </ul>

                  <p>
                    <strong>2.3 Données de paiement :</strong>
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Informations de facturation (traitées par Stripe)</li>
                    <li>Historique des transactions</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-primary mb-4">
                  3. Finalités du traitement
                </h2>
                <div className="space-y-4 text-gray-300">
                  <p>Nous utilisons vos données personnelles pour :</p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>
                      Gérer vos réservations et fournir nos services de
                      transport
                    </li>
                    <li>Vous contacter concernant votre réservation</li>
                    <li>Traiter les paiements de manière sécurisée</li>
                    <li>Améliorer la qualité de nos services</li>
                    <li>Respecter nos obligations légales et réglementaires</li>
                    <li>
                      Vous envoyer des informations sur nos services (avec votre
                      consentement)
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-primary mb-4">
                  4. Base légale du traitement
                </h2>
                <div className="space-y-4 text-gray-300">
                  <p>
                    Le traitement de vos données personnelles est fondé sur :
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>
                      <strong>L'exécution du contrat :</strong> pour la gestion
                      de vos réservations
                    </li>
                    <li>
                      <strong>L'intérêt légitime :</strong> pour l'amélioration
                      de nos services
                    </li>
                    <li>
                      <strong>Le consentement :</strong> pour l'envoi de
                      communications marketing
                    </li>
                    <li>
                      <strong>L'obligation légale :</strong> pour la
                      conservation des factures
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-primary mb-4">
                  5. Partage des données
                </h2>
                <div className="space-y-4 text-gray-300">
                  <p>Vos données peuvent être partagées avec :</p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>
                      <strong>Nos chauffeurs :</strong> uniquement les
                      informations nécessaires au service
                    </li>
                    <li>
                      <strong>Stripe :</strong> pour le traitement sécurisé des
                      paiements
                    </li>
                    <li>
                      <strong>Resend :</strong> pour l'envoi d'emails de
                      confirmation
                    </li>
                    <li>
                      <strong>Google Calendar :</strong> pour la gestion des
                      plannings
                    </li>
                  </ul>
                  <p>Nous ne vendons jamais vos données à des tiers.</p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-primary mb-4">
                  6. Conservation des données
                </h2>
                <div className="space-y-4 text-gray-300">
                  <p>Nous conservons vos données personnelles :</p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>
                      <strong>Données de réservation :</strong> 3 ans après le
                      service
                    </li>
                    <li>
                      <strong>Données de facturation :</strong> 10 ans
                      (obligation légale)
                    </li>
                    <li>
                      <strong>Données marketing :</strong> jusqu'à votre
                      désinscription
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-primary mb-4">
                  7. Vos droits
                </h2>
                <div className="space-y-4 text-gray-300">
                  <p>
                    Conformément au RGPD, vous disposez des droits suivants :
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>
                      <strong>Droit d'accès :</strong> obtenir une copie de vos
                      données
                    </li>
                    <li>
                      <strong>Droit de rectification :</strong> corriger vos
                      données inexactes
                    </li>
                    <li>
                      <strong>Droit à l'effacement :</strong> supprimer vos
                      données
                    </li>
                    <li>
                      <strong>Droit à la limitation :</strong> limiter le
                      traitement
                    </li>
                    <li>
                      <strong>Droit à la portabilité :</strong> récupérer vos
                      données
                    </li>
                    <li>
                      <strong>Droit d'opposition :</strong> vous opposer au
                      traitement
                    </li>
                    <li>
                      <strong>Droit de retrait du consentement :</strong> à tout
                      moment
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-primary mb-4">
                  8. Sécurité
                </h2>
                <div className="space-y-4 text-gray-300">
                  <p>
                    Nous mettons en place des mesures techniques et
                    organisationnelles appropriées pour protéger vos données :
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Chiffrement des données sensibles</li>
                    <li>Accès restreint aux données personnelles</li>
                    <li>Surveillance et audit réguliers</li>
                    <li>Formation du personnel à la protection des données</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-primary mb-4">
                  9. Cookies
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Notre site utilise des cookies techniques nécessaires au
                  fonctionnement du service. Nous n'utilisons pas de cookies de
                  tracking ou publicitaires sans votre consentement explicite.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-primary mb-4">
                  10. Contact et réclamations
                </h2>
                <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20">
                  <p className="text-gray-300 mb-4">
                    Pour exercer vos droits ou pour toute question concernant
                    cette politique :
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
                  <p className="text-gray-400 text-sm mt-4">
                    Vous avez également le droit de déposer une réclamation
                    auprès de la CNIL (Commission Nationale de l'Informatique et
                    des Libertés).
                  </p>
                </div>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
