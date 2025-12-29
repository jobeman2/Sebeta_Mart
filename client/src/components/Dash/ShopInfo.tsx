"use client";

import { useState, useContext, useEffect } from "react";
import { AuthContext } from "@/context/Authcontext";
import {
  Building,
  MapPin,
  TrendingUp,
  Edit,
  Store,
  DollarSign,
} from "lucide-react";

interface ShopInfoProps {
  shopName: string;
  location: string;
  revenueToday: number;
  onEditShop: () => void;
  shopData?: any; // Optional shop data for editing
  onUpdateShop?: (updatedData: any) => void; // Callback for updating shop
}

export default function ShopInfo({
  shopName,
  location,
  revenueToday,
  onEditShop,
  shopData,
  onUpdateShop,
}: ShopInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editShopData, setEditShopData] = useState({
    shopName: shopData?.shop_name || "",
    shopDesc: shopData?.shop_description || "",
    shopAddress: shopData?.shop_address || "",
    businessLicense: shopData?.business_license || "",
    governmentId: shopData?.government_id || "",
    nationalId: shopData?.national_id_number || "",
  });
  const [error, setError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const { user, loading } = useContext(AuthContext);

  const stats = [
    {
      label: "Shop Name",
      value: shopName || "Not set",
      icon: <Store className="w-4 h-4" />,
      color: "bg-[#3399FF]",
      bgColor: "bg-[#3399FF]/10",
      textColor: "text-[#3399FF]",
    },
    {
      label: "Location",
      value: location || "Not specified",
      icon: <MapPin className="w-4 h-4" />,
      color: "bg-gray-800",
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
    },
    {
      label: "Revenue Today",
      value:
        revenueToday > 0 ? `ETB ${revenueToday.toLocaleString()}` : "ETB 0",
      icon: <TrendingUp className="w-4 h-4" />,
      color: "bg-[#EF837B]",
      bgColor: "bg-[#EF837B]/10",
      textColor: "text-[#EF837B]",
    },
  ];

  // Reset form when shopData changes
  useEffect(() => {
    if (shopData) {
      setEditShopData({
        shopName: shopData.shop_name || "",
        shopDesc: shopData.shop_description || "",
        shopAddress: shopData.shop_address || "",
        businessLicense: shopData.business_license || "",
        governmentId: shopData.government_id || "",
        nationalId: shopData.national_id_number || "",
      });
    }
  }, [shopData]);

  const handleEditClick = () => {
    setIsEditing(true);
    onEditShop(); // Call parent's onEditShop if needed
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (loading || !user) {
      setError("User is not loaded. Please wait or reload.");
      return;
    }

    if (!editShopData.shopName.trim()) {
      setError("Shop Name is required.");
      return;
    }

    setFormLoading(true);

    try {
      // Determine if we're creating new or updating existing
      const url = shopData
        ? `http://localhost:5000/sellers/${shopData.id}` // Update endpoint
        : "http://localhost:5000/sellers"; // Create endpoint

      const method = shopData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          shop_name: editShopData.shopName.trim(),
          shop_description: editShopData.shopDesc.trim(),
          shop_address: editShopData.shopAddress.trim(),
          business_license: editShopData.businessLicense.trim(),
          government_id: editShopData.governmentId.trim(),
          national_id_number: editShopData.nationalId.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to save shop");
      } else {
        if (onUpdateShop) {
          onUpdateShop(data); // Update parent with new data
        }
        setIsEditing(false); // Exit edit mode
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Try again later.");
    } finally {
      setFormLoading(false);
    }
  };

  // Show edit form when isEditing is true
  if (isEditing) {
    if (loading) return <p>Loading user...</p>;
    if (!user) return <p>Please login to edit shop.</p>;

    return (
      <div className="bg-white border mt-6 border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {shopData ? "Edit Shop" : "Create Your Shop"}
            </h2>
            <p className="text-sm text-gray-500">
              {shopData
                ? "Update your shop details"
                : "Fill in your shop details"}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Cancel editing"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shop Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Shop Name"
              value={editShopData.shopName}
              onChange={(e) =>
                setEditShopData({ ...editShopData, shopName: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3399FF] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shop Description
            </label>
            <textarea
              placeholder="Shop Description"
              value={editShopData.shopDesc}
              onChange={(e) =>
                setEditShopData({ ...editShopData, shopDesc: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3399FF] focus:border-transparent h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shop Address
            </label>
            <input
              type="text"
              placeholder="Shop Address"
              value={editShopData.shopAddress}
              onChange={(e) =>
                setEditShopData({
                  ...editShopData,
                  shopAddress: e.target.value,
                })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3399FF] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business License
            </label>
            <input
              type="text"
              placeholder="Business License"
              value={editShopData.businessLicense}
              onChange={(e) =>
                setEditShopData({
                  ...editShopData,
                  businessLicense: e.target.value,
                })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3399FF] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Government ID
            </label>
            <input
              type="text"
              placeholder="Government ID"
              value={editShopData.governmentId}
              onChange={(e) =>
                setEditShopData({
                  ...editShopData,
                  governmentId: e.target.value,
                })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3399FF] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              National ID Number
            </label>
            <input
              type="text"
              placeholder="National ID Number"
              value={editShopData.nationalId}
              onChange={(e) =>
                setEditShopData({ ...editShopData, nationalId: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3399FF] focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 px-4 py-3 bg-[#3399FF] text-white rounded-lg hover:bg-[#2980db] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formLoading
                ? "Saving..."
                : shopData
                ? "Update Shop"
                : "Create Shop"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Show normal ShopInfo when not editing
  return (
    <div className="bg-white border mt-6 border-gray-200 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Shop Information
          </h2>
          <p className="text-sm text-gray-500">Store details & performance</p>
        </div>
        <button
          onClick={handleEditClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
          title="Edit shop details"
        >
          <Edit className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="space-y-4 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className={`p-2 rounded-lg ${stat.bgColor} flex-shrink-0`}>
              <div className={stat.textColor}>{stat.icon}</div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="font-medium text-gray-900 truncate">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Performance</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center hover:bg-gray-100 transition-colors">
            <div className="text-lg font-semibold text-gray-900">12</div>
            <div className="text-xs text-gray-500">Products</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center hover:bg-gray-100 transition-colors">
            <div className="text-lg font-semibold text-gray-900">4.8</div>
            <div className="text-xs text-gray-500">Rating</div>
          </div>
        </div>
      </div>

      {/* Edit Button */}
      <button
        onClick={handleEditClick}
        className="w-full py-3 rounded-lg border border-gray-300 hover:border-[#3399FF] hover:bg-[#3399FF]/5 transition-all duration-200 text-gray-700 hover:text-[#3399FF] font-medium text-sm flex items-center justify-center gap-2 group"
      >
        <Edit className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        {shopData ? "Edit Shop Details" : "Create Shop"}
      </button>
    </div>
  );
}
