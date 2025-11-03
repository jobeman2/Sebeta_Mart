"use client";
import { useState, useContext } from "react";
import { AuthContext } from "@/context/Authcontext";

interface Props {
  onShopCreated: (seller: any) => void; // callback to update dashboard
}

export default function CreateShopForm({ onShopCreated }: Props) {
  const { user, loading } = useContext(AuthContext); // ✅ use context
  const [shopName, setShopName] = useState("");
  const [shopDesc, setShopDesc] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [businessLicense, setBusinessLicense] = useState("");
  const [governmentId, setGovernmentId] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [error, setError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (loading || !user) {
      setError("User is not loaded. Please wait or reload.");
      return;
    }

    if (!shopName.trim()) {
      setError("Shop Name is required.");
      return;
    }

    setFormLoading(true);

    try {
      const res = await fetch("http://localhost:5000/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id, // ✅ get ID from context
          shop_name: shopName.trim(),
          shop_description: shopDesc.trim(),
          shop_address: shopAddress.trim(),
          business_license: businessLicense.trim(),
          government_id: governmentId.trim(),
          national_id_number: nationalId.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create shop");
      } else {
        onShopCreated(data); // update parent dashboard
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Try again later.");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <p>Loading user...</p>;
  if (!user) return <p>Please login to create a shop.</p>;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded shadow-md space-y-4 max-w-md mx-auto"
    >
      <h2 className="text-xl font-bold">Create Your Shop</h2>

      {error && <p className="text-red-500">{error}</p>}

      <input
        type="text"
        placeholder="Shop Name *"
        value={shopName}
        onChange={(e) => setShopName(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <textarea
        placeholder="Shop Description"
        value={shopDesc}
        onChange={(e) => setShopDesc(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Shop Address"
        value={shopAddress}
        onChange={(e) => setShopAddress(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Business License"
        value={businessLicense}
        onChange={(e) => setBusinessLicense(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Government ID"
        value={governmentId}
        onChange={(e) => setGovernmentId(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        placeholder="National ID Number"
        value={nationalId}
        onChange={(e) => setNationalId(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <button
        type="submit"
        disabled={formLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        {formLoading ? "Creating..." : "Create Shop"}
      </button>
    </form>
  );
}
