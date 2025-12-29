"use client";
import { useState } from "react";

// Define proper Shop type instead of `any`
interface Shop {
  id: number;
  shop_name: string;
  shop_description?: string;
  shop_address?: string;
  business_license?: string;
  government_id?: string;
  national_id_number?: string;
  user_id: number;
}

interface Props {
  userId: number;
  onShopCreated: (seller: Shop) => void;
}

export default function CreateShopForm({ userId, onShopCreated }: Props) {
  const [shopName, setShopName] = useState("");
  const [shopDesc, setShopDesc] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [businessLicense, setBusinessLicense] = useState("");
  const [governmentId, setGovernmentId] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!shopName.trim()) {
      setError("Shop Name is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sellers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          shop_name: shopName.trim(),
          shop_description: shopDesc.trim(),
          shop_address: shopAddress.trim(),
          business_license: businessLicense.trim(),
          government_id: governmentId.trim(),
          national_id_number: nationalId.trim(),
        }),
      });

      const data: Shop = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to create shop");
      } else {
        onShopCreated(data);
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-5">
        Create Your Shop
      </h2>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Shop Name */}
        <div>
          <label className="block text-gray-700 mb-1">Shop Name *</label>
          <input
            type="text"
            placeholder="My Awesome Shop"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 mb-1">Description</label>
          <textarea
            placeholder="Describe your shop"
            value={shopDesc}
            onChange={(e) => setShopDesc(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-gray-700 mb-1">Address</label>
          <input
            type="text"
            placeholder="123 Main St, City"
            value={shopAddress}
            onChange={(e) => setShopAddress(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* IDs & Business License Inline */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-gray-700 mb-1">Business License</label>
            <input
              type="text"
              placeholder="License #"
              value={businessLicense}
              onChange={(e) => setBusinessLicense(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Government ID</label>
            <input
              type="text"
              placeholder="ID #"
              value={governmentId}
              onChange={(e) => setGovernmentId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">National ID</label>
            <input
              type="text"
              placeholder="National ID"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? "Creating..." : "Create Shop"}
        </button>
      </form>
    </div>
  );
}
