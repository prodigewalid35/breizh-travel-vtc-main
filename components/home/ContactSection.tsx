"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { setupScrollAnimation } from "@/lib/animations";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const cleanup = setupScrollAnimation();
    return cleanup;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !message) {
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
        body: JSON.stringify({ name, email, phone, subject, message }),
      });

      const result = await response.json();

      if (result.success) {
        setName("");
        setEmail("");
        setPhone("");
        setSubject("");
        setMessage("");
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

  return (
    <section id="contact" className="section-padding bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prenez <span className="text-primary">Contact</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Une question sur nos prestations ? N'hésitez pas à nous contacter.
            Nous sommes à votre disposition pour vous accompagner et répondre à
            toutes vos demandes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="fade-in" style={{ transitionDelay: "0.2s" }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Nom <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-secondary w-full rounded-lg border-0 px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:outline-none led-glow"
                  placeholder="Votre nom complet"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Adresse e-mail <span className="text-primary">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary w-full rounded-lg border-0 px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:outline-none led-glow"
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Téléphone <span className="text-primary">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-secondary w-full rounded-lg border-0 px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:outline-none led-glow"
                  placeholder="+33 06 04 18 41 21"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Sujet <span className="text-primary">*</span>
                </label>
                <select
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-secondary w-full rounded-lg border-0 px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:outline-none led-glow"
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="reservation">Réservation</option>
                  <option value="devis">Demande de devis</option>
                  <option value="information">Information générale</option>
                  <option value="reclamation">Réclamation</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Message <span className="text-primary">*</span>
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="bg-secondary w-full rounded-lg border-0 px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:outline-none led-glow"
                  placeholder="Votre message..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative inline-flex items-center justify-center w-full"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
                <span
                  className={`relative flex items-center gap-2 bg-black px-8 py-4 rounded-full text-base font-medium transition-colors group-hover:bg-black/80 w-full justify-center ${
                    loading ? "text-gray-400 cursor-not-allowed" : "text-white"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      Envoyer
                      <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>

          <div className="fade-in" style={{ transitionDelay: "0.4s" }}>
            <div className="bg-card rounded-2xl p-8 led-glow">
              <h3 className="text-2xl font-semibold mb-6">Nos coordonnées</h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full p-3">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Adresse</h4>
                    <p className="text-gray-400">Bretagne, France</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full p-3">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Téléphone</h4>
                    <a
                      href="tel:+330604184121"
                      className="text-gray-400 hover:text-primary transition-colors"
                    >
                      +33 06 04 18 41 21
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full p-3">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">E-mail</h4>
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
          </div>
        </div>
      </div>
    </section>
  );
}
