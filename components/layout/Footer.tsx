import Link from "next/link";
import {
  Instagram,
  Facebook,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-primary font-semibold text-lg mb-4">
              À propos de Breizh Travel VTC
            </h3>
            <p className="text-gray-400 mb-6">
              Nous proposons des services de transport privé haut de gamme,
              alliant professionnalisme, ponctualité et luxe pour satisfaire les
              clients les plus exigeants.
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-white hover:text-primary transition-colors"
              >
                <Instagram size={20} />
              </Link>
              <Link
                href="#"
                className="text-white hover:text-primary transition-colors"
              >
                <Facebook size={20} />
              </Link>
              <Link
                href="#"
                className="text-white hover:text-primary transition-colors"
              >
                <Twitter size={20} />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-primary font-semibold text-lg mb-4">
              Liens rapides
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#home"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="#services"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="#gallery"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Destinations
                </Link>
              </li>
              <li>
                <Link
                  href="#vehicle"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Véhicules
                </Link>
              </li>
              <li>
                <Link
                  href="#booking"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Réservation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-primary font-semibold text-lg mb-4">
              Informations de contact
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3">
                <Phone className="text-primary shrink-0" size={18} />
                <span className="text-gray-400">+33 06 04 18 41 21</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="text-primary shrink-0" size={18} />
                <span className="text-gray-400">
                  contact@breizhtravelvtc.fr
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Breizh Travel VTC. Tous droits
            réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
