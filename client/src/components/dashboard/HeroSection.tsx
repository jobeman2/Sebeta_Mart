"use client";

import { CheckCircle2 } from "lucide-react";

interface HeroSectionProps {
  userName: string;
  onViewOrders: () => void;
  isVerified?: boolean;
  accountType?: "seller" | "customer";
}

const HeroSection: React.FC<HeroSectionProps> = ({
  userName,
  onViewOrders,
  isVerified = false,
  accountType = "customer",
}) => {
  // Capitalize the first letter of each word in the name
  const formattedName = userName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-xl p-6 flex justify-between items-center">
      <div>
        <div className="text-sm opacity-80">Welcome back,</div>
        <div className="flex items-center gap-2 mt-1">
          <div className="text-2xl font-semibold">{formattedName}</div>
          {isVerified && (
            <CheckCircle2 className="w-5 h-5 text-green-300" title="Verified Account" />
          )}
        </div>

        <div className="text-sm opacity-80 mt-1">
          {accountType === "seller" ? "Seller Account" : "Buyer Account"}
        </div>
      </div>

      <button
        onClick={onViewOrders}
        className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-md text-sm font-medium transition"
      >
        {accountType === "seller" ? "Add Product" : "View Orders"}
      </button>
    </div>
  );
};

export default HeroSection;
