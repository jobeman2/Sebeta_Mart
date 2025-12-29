"use client";

import { useState, useContext } from "react";
import { AuthContext } from "@/context/Authcontext";

interface CreateShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShopCreated: (shop: any) => void;
}

export default function CreateShopModal({ isOpen, onClose, onShopCreated }: CreateShopModalProps) {
  const { user, loading } = useContext(AuthContext);
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
          user_id: user.id,
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
        onShopCreated(data);
        resetForm();
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Try again later.");
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setShopName("");
    setShopDesc("");
    setShopAddress("");
    setBusinessLicense("");
    setGovernmentId("");
    setNationalId("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  if (loading) return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-8 rounded-lg">
        <p>Loading user...</p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-8 rounded-lg">
        <p className="text-red-500">Please login to create a shop.</p>
        <button
          onClick={handleClose}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Create Your Shop</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 text-2xl"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shop Name *
              </label>
              <input
                type="text"
                placeholder="Enter shop name"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shop Description
              </label>
              <textarea
                placeholder="Describe your shop"
                value={shopDesc}
                onChange={(e) => setShopDesc(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shop Address
              </label>
              <input
                type="text"
                placeholder="Enter shop address"
                value={shopAddress}
                onChange={(e) => setShopAddress(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business License
              </label>
              <input
                type="text"
                placeholder="Enter business license"
                value={businessLicense}
                onChange={(e) => setBusinessLicense(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Government ID
              </label>
              <input
                type="text"
                placeholder="Enter government ID"
                value={governmentId}
                onChange={(e) => setGovernmentId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                National ID Number
              </label>
              <input
                type="text"
                placeholder="Enter national ID number"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? "Creating..." : "Create Shop"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}