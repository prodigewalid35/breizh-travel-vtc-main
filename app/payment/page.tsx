"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { ArrowLeft, CreditCard, Lock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

// Load Stripe with the public key. Ensure this key is correctly set in your environment variables.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Options for the CardElement styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      fontFamily: "Arial, sans-serif",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
  },
  hidePostalCode: false,
};

// CheckoutForm component handles the payment process
function CheckoutForm({
  bookingData,
  amount,
}: {
  bookingData: any;
  amount: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Effect to create a Payment Intent when bookingData or amount changes
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        // Fetch API to create a payment intent on the server
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingData,
            amount: Math.round(amount * 100),
          }), // Convert amount to cents
        });

        const data = await response.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError("Erreur lors de la création du paiement");
        }
      } catch (err) {
        setError("Erreur de connexion");
      }
    };

    if (bookingData) {
      createPaymentIntent();
    }
  }, [bookingData, amount]);

  // Handler for form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      // Stripe.js has not yet loaded.
      return;
    }

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Erreur avec la carte");
      setLoading(false);
      return;
    }

    // Confirm the payment with Stripe
    const { error: stripeError, paymentIntent } =
      await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: bookingData.name,
            email: bookingData.email,
            phone: bookingData.phone,
          },
        },
      });

    if (stripeError) {
      setError(stripeError.message || "Erreur de paiement");
      setLoading(false);
    } else if (paymentIntent?.status === "succeeded") {
      // If payment is successful, confirm the booking on the server
      try {
        const response = await fetch("/api/confirm-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        });

        const result = await response.json();
        if (result.success) {
          router.push(`/success?bookingId=${result.bookingId}`); // Redirect to success page
        } else {
          setError("Erreur lors de la confirmation");
        }
      } catch (err) {
        setError("Erreur de confirmation");
      }
      setLoading(false);
    }
  };

  // Display message if booking data is missing
  if (!bookingData) {
    return (
      <div className="text-center">
        <p className="text-red-400">Données de réservation manquantes</p>
        <Link href="/" className="text-primary hover:underline">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/20 rounded-full p-2">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Paiement sécurisé</h2>
        </div>

        {/* Booking Summary Section */}
        <div className="bg-white/5 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            Récapitulatif de votre réservation
          </h3>
          <div className="space-y-2 text-gray-300">
            <div className="flex justify-between">
              <span>Date :</span>
              <span>
                {new Date(bookingData.date).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Heure :</span>
              <span>{bookingData.time}</span>
            </div>
            {/* Pickup address with truncation and title for full address */}
            <div className="flex justify-between items-start">
              <span className="flex-shrink-0 mr-2">Départ :</span>
              <span
                className="text-right truncate max-w-[60%]"
                title={bookingData.pickup}
              >
                {bookingData.pickup}
              </span>
            </div>
            {/* Dropoff address with truncation and title for full address */}
            {bookingData.dropoff && (
              <div className="flex justify-between items-start">
                <span className="flex-shrink-0 mr-2">Arrivée :</span>
                <span
                  className="text-right truncate max-w-[60%]"
                  title={bookingData.dropoff}
                >
                  {bookingData.dropoff}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Client :</span>
              <span>{bookingData.name}</span>
            </div>

            {/* Affichage spécifique selon le type */}
            {bookingData.type === "disposition" ? (
              <>
                <hr className="border-white/10 my-3" />
                <div className="flex justify-between">
                  <span>Type :</span>
                  <span>Mise à disposition</span>
                </div>
                {bookingData.pricing && (
                  <>
                    <div className="flex justify-between">
                      <span>Forfait :</span>
                      <span className="capitalize">
                        {bookingData.package || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Prix total :</span>
                      <span>{bookingData.pricing.finalPrice}€</span>
                    </div>
                    <div className="flex justify-between text-primary">
                      <span>Acompte (30%) :</span>
                      <span>
                        {Math.round(bookingData.pricing.finalPrice * 0.3)}€
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-sm">
                      <span>Solde jour J :</span>
                      <span>
                        {Math.round(bookingData.pricing.finalPrice * 0.7)}€
                      </span>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <hr className="border-white/10 my-3" />
                <div className="flex justify-between">
                  <span>Type :</span>
                  <span>Trajet simple</span>
                </div>
                {bookingData.pricing && (
                  <div className="flex justify-between">
                    <span>Distance :</span>
                    <span>{bookingData.pricing.distance} km</span>
                  </div>
                )}
              </>
            )}

            <hr className="border-white/10 my-4" />
            <div className="flex justify-between text-xl font-bold text-primary">
              <span>
                {bookingData.type === "disposition"
                  ? "Acompte à payer :"
                  : "Total :"}
              </span>
              <span>{amount}€</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Informations de carte
            </label>
            <div className="bg-white rounded-2xl p-4 border border-gray-300">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Lock className="h-4 w-4" />
            <span>Paiement sécurisé par Stripe</span>
          </div>

          <button
            type="submit"
            disabled={!stripe || loading || !clientSecret}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-2xl transition-colors"
          >
            {loading ? "Traitement..." : `Payer ${amount}€`}
          </button>
        </form>
      </div>
    </div>
  );
}

// Main PaymentPage component
export default function PaymentPage() {
  const searchParams = useSearchParams();
  const [bookingData, setBookingData] = useState<any>(null);
  const [amount, setAmount] = useState(50); // Default amount

  // Effect to retrieve booking data from URL search parameters
  useEffect(() => {
    const pricingParam = searchParams.get("pricing");
    const bookingType = searchParams.get("type");
    let pricing = null;

    if (pricingParam && pricingParam !== "null") {
      try {
        pricing = JSON.parse(pricingParam);
      } catch (e) {
        console.error("Erreur parsing pricing:", e);
      }
    }

    const data = {
      id: searchParams.get("id"),
      type: bookingType,
      date: searchParams.get("date"),
      time: searchParams.get("time"),
      pickup: searchParams.get("pickup"),
      dropoff: searchParams.get("dropoff"),
      name: searchParams.get("name"),
      phone: searchParams.get("phone"),
      email: searchParams.get("email") || "",
      pricing: pricing,
    };

    if (data.id && data.date && data.time) {
      setBookingData(data);

      // Set the amount based on pricing or default to 50€
      if (pricing) {
        console.log("📊 Pricing reçu:", pricing);
        console.log("📋 Type de réservation:", bookingType);

        if (bookingType === "disposition") {
          // Pour mise à disposition, on paie l'acompte de 30%
          const finalPrice = pricing.finalPrice || 0;
          const depositAmount = Math.round(finalPrice * 0.3);
          console.log("💰 Prix total disposition:", finalPrice, "€");
          console.log("💳 Acompte 30%:", depositAmount, "€");
          setAmount(depositAmount);
        } else {
          // Pour trajet simple, on paie le prix total
          const finalPrice =
            pricing.pricing?.finalPrice || pricing.finalPrice || 0;
          console.log("💰 Prix trajet simple:", finalPrice, "€");
          setAmount(finalPrice);
        }
      } else {
        console.log(
          "⚠️ Pas de pricing trouvé, utilisation du montant par défaut"
        );
        setAmount(50);
      }
    }
  }, [searchParams, setAmount]);

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
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Finaliser votre <span className="text-primary">réservation</span>
          </h1>
          <p className="text-gray-400">
            Complétez votre paiement pour confirmer votre réservation VTC
          </p>
        </motion.div>

        {/* Elements provider for Stripe */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Elements stripe={stripePromise}>
            <CheckoutForm bookingData={bookingData} amount={amount} />
          </Elements>
        </motion.div>
      </div>
    </motion.div>
  );
}
