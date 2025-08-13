"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.message ||
      !formData.subject ||
      !formData.phone
    ) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
        toast({
          title: "Message envoyé !",
          description: "Nous vous répondrons dans les plus brefs délais.",
          variant: "default",
        });
      } else {
        toast({
          title: "Erreur d'envoi",
          description: result.error || "Une erreur est survenue",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Impossible d'envoyer le message. Réessayez plus tard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
                Message <span className="text-green-500">envoyé</span> !
              </motion.h1>

              <motion.p
                className="text-gray-400 text-lg mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                Merci pour votre message. Nous vous répondrons dans les plus
                brefs délais.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-full transition-colors"
                >
                  Retour à l'accueil
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }

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
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Contactez <span className="text-primary">Breizh Travel VTC</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Une question sur nos services ? Un devis personnalisé ? N'hésitez
            pas à nous contacter. Notre équipe vous répondra rapidement.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Formulaire de contact */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-3xl blur-2xl"></div>
              <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 shadow-xl relative border border-white/5">
                <h2 className="text-2xl font-bold mb-6">
                  Envoyez-nous un message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Nom complet <span className="text-primary">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                        placeholder="Votre nom complet"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Email <span className="text-primary">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                        placeholder="+33 06 04 18 41 21"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Sujet
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                      >
                        <option value="">Sélectionnez un sujet</option>
                        <option value="reservation">Réservation</option>
                        <option value="devis">Demande de devis</option>
                        <option value="information">
                          Information générale
                        </option>
                        <option value="reclamation">Réclamation</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Message <span className="text-primary">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all resize-none"
                      placeholder="Décrivez votre demande en détail..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative inline-flex items-center justify-center w-full"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
                    <span className="relative flex items-center gap-2 bg-black px-8 py-4 rounded-full text-base font-medium text-white transition-colors group-hover:bg-black/80 w-full justify-center">
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          Envoyer le message
                          <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </span>
                  </button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Informations de contact */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="space-y-8"
          >
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/5">
              <h3 className="text-2xl font-semibold mb-6">Nos coordonnées</h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 rounded-full p-3 mt-1">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1 text-white">Adresse</h4>
                    <p className="text-gray-400">Bretagne, France</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 rounded-full p-3 mt-1">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1 text-white">Téléphone</h4>
                    <a
                      href="tel:+330604184121"
                      className="text-gray-400 hover:text-primary transition-colors"
                    >
                      +33 06 04 18 41 21
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 rounded-full p-3 mt-1">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1 text-white">E-mail</h4>
                    <a
                      href="mailto:contact@breizhtravelvtc.fr"
                      className="text-gray-400 hover:text-primary transition-colors"
                    >
                      contact@breizhtravelvtc.fr
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/5">
              <h3 className="text-xl font-semibold mb-4">
                Horaires d'ouverture
              </h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex justify-between">
                  <span>Lundi - Vendredi</span>
                  <span className="text-white">7h00 - 22h00</span>
                </div>
                <div className="flex justify-between">
                  <span>Samedi</span>
                  <span className="text-white">8h00 - 20h00</span>
                </div>
                <div className="flex justify-between">
                  <span>Dimanche</span>
                  <span className="text-white">9h00 - 18h00</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 backdrop-blur-xl rounded-3xl p-8 border border-primary/20">
              <h3 className="text-xl font-semibold mb-4 text-primary">
                Réponse rapide
              </h3>
              <p className="text-gray-300">
                Nous nous engageons à répondre à tous vos messages dans un délai
                de
                <span className="text-white font-semibold">
                  {" "}
                  2 heures maximum
                </span>{" "}
                pendant nos heures d'ouverture.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
