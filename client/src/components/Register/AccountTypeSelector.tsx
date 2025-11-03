"use client";

import { useState } from "react";
import { User, Store } from "lucide-react";

interface AccountSelectorProps {
  onSelect: (role: "buyer" | "seller") => void;
}

export default function AccountSelector({ onSelect }: AccountSelectorProps) {
  const [selected, setSelected] = useState<"buyer" | "seller" | "">("");

  const handleSelect = (role: "buyer" | "seller") => {
    setSelected(role);
    onSelect(role);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Account Type
      </label>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => handleSelect("buyer")}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 
            ${
              selected === "buyer"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
        >
          <User className="w-4 h-4" />
          Buyer
        </button>

        <button
          type="button"
          onClick={() => handleSelect("seller")}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 
            ${
              selected === "seller"
                ? "bg-green-600 text-white border-green-600 shadow-sm"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
        >
          <Store className="w-4 h-4" />
          Seller
        </button>
      </div>
    </div>
  );
}
