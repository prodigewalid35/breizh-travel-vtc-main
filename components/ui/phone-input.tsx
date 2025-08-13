"use client";

import { Input } from "@/components/ui/input";
import { Phone } from "lucide-react";
import React, { InputHTMLAttributes } from "react";

// ▼▼▼ CORRECTION APPLIQUÉE ICI ▼▼▼
// On exclut le `onChange` par défaut de l'input pour éviter un conflit de type,
// puis on ajoute notre propre définition de `onChange`.
interface PhoneInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
}
// ▲▲▲ FIN DE LA CORRECTION ▲▲▲

const formatPhoneNumber = (value: string): string => {
  // 1. Ne garde que les chiffres
  const cleaned = value.replace(/\D/g, "");

  // 2. Limite à 10 chiffres (format français)
  const truncated = cleaned.substring(0, 10);

  // 3. Applique le formatage "XX XX XX XX XX"
  const matches = truncated.match(/.{1,2}/g);
  return matches ? matches.join(" ") : "";
};

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formattedValue = formatPhoneNumber(e.target.value);
      onChange(formattedValue);
    };

    return (
      <div className="relative group">
        {/* Les div pour le style de fond et l'effet de lueur, repris de votre design */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-2xl blur transition-opacity opacity-0 group-hover:opacity-100"></div>
        <div className="absolute inset-0 bg-black/40 rounded-2xl"></div>

        {/* L'icône de téléphone */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <Phone className="h-5 w-5 text-blue-500" />
        </div>

        {/* L'input lui-même */}
        <Input
          type="tel" // 'tel' est sémantiquement correct et améliore l'UX sur mobile
          value={value}
          onChange={handleInputChange}
          ref={ref}
          // On ajoute la longueur max pour correspondre au format "06 12 34 56 78" (10 chiffres + 4 espaces)
          maxLength={14}
          {...props}
          // Les classes de style pour correspondre parfaitement à votre design
          className="relative bg-transparent w-full pl-12 pr-4 py-4 rounded-2xl text-white placeholder-gray-500 border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all z-10 led-glow"
        />
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
