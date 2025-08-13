"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  return (
    <motion.div
      className="min-h-screen bg-black text-white flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            className="mb-8"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6"
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(34, 197, 94, 0.4)",
                  "0 0 0 20px rgba(34, 197, 94, 0)",
                  "0 0 0 0 rgba(34, 197, 94, 0)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CheckCircle className="h-10 w-10 text-green-500" />
            </motion.div>

            <motion.h1
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Paiement <span className="text-green-500">confirmé</span> !
            </motion.h1>

            <motion.p
              className="text-gray-400 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Votre réservation VTC a été confirmée avec succès
            </motion.p>
          </motion.div>

          <motion.div
            className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <h2 className="text-xl font-semibold mb-6">
              Que se passe-t-il maintenant ?
            </h2>

            <div className="space-y-4 text-left">
              <motion.div
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                <div className="bg-primary/20 rounded-full p-2 mt-1">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">
                    Réservation ajoutée au calendrier
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Votre course a été automatiquement ajoutée au planning du
                    chauffeur
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.4 }}
              >
                <div className="bg-primary/20 rounded-full p-2 mt-1">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Contact 15 minutes avant</h3>
                  <p className="text-gray-400 text-sm">
                    Votre chauffeur vous contactera 15 minutes avant l'heure
                    prévue
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0, duration: 0.4 }}
              >
                <div className="bg-primary/20 rounded-full p-2 mt-1">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Prise en charge ponctuelle</h3>
                  <p className="text-gray-400 text-sm">
                    Soyez prêt à l'heure et au lieu de rendez-vous convenu
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {bookingId && (
            <motion.div
              className="bg-white/5 rounded-2xl p-4 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, duration: 0.4 }}
            >
              <p className="text-sm text-gray-400">
                Numéro de réservation :{" "}
                <span className="text-white font-mono">{bookingId}</span>
              </p>
            </motion.div>
          )}

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <p className="text-gray-400">
              Un email de confirmation a été envoyé avec tous les détails de
              votre réservation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-full transition-colors"
              >
                Retour à l'accueil
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="tel:+330604184121"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-full transition-colors"
              >
                Nous contacter
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
