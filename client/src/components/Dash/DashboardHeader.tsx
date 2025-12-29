"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AddProductModal from "./Addproduct";
import ProductManagementModal from "./ProductManagementModal";
import { Package, Plus } from "lucide-react";

interface DashboardHeaderProps {
  shopName?: string;
  sellerId?: string;
  userRole?: string;
  onProductAdded?: (product: any) => void;
}

export default function DashboardHeader({
  shopName,
  sellerId,
  userRole,
  onProductAdded,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showProductManagementModal, setShowProductManagementModal] =
    useState(false);

  const getHeaderTitle = () => {
    switch (userRole) {
      case "seller":
        return shopName ? `${shopName} Dashboard` : "Seller Dashboard";
      case "buyer":
        return "My Dashboard";
      case "delivery":
        return "Delivery Dashboard";
      default:
        return "Dashboard";
    }
  };

  const getWelcomeMessage = () => {
    const currentHour = new Date().getHours();
    let greeting = "Good ";
    if (currentHour < 12) greeting += "morning";
    else if (currentHour < 18) greeting += "afternoon";
    else greeting += "evening";

    return `${greeting}! Here's your overview.`;
  };

  const getRoleColor = () => {
    switch (userRole) {
      case "seller":
        return "bg-[#3399FF]";
      case "buyer":
        return "bg-[#EF837B]";
      case "delivery":
        return "bg-gray-800";
      default:
        return "bg-gray-800";
    }
  };

  const handleProductAdded = (productData: any) => {
    setShowAddProductModal(false);
    if (onProductAdded) {
      onProductAdded(productData);
    }
  };

  const handleProductManaged = (productData: any) => {
    setShowProductManagementModal(false);
    if (onProductAdded) {
      onProductAdded(productData);
    }
  };

  const handleAddProductClick = () => {
    router.push("/addproduct");
  };

  return (
    <>
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-8 ${getRoleColor()} rounded`}></div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {getHeaderTitle()}
                </h1>
              </div>
              <p className="text-gray-500 mt-2">{getWelcomeMessage()}</p>
            </div>

            <div className="flex items-center gap-4">
              {userRole === "seller" && (
                <div className="flex gap-3">
                  <button
                    onClick={handleAddProductClick}
                    className="px-5 py-2.5 bg-white text-gray-900 font-medium rounded-lg border-2 border-gray-900 
                             hover:bg-gray-900 hover:text-white transition-all duration-200 
                             focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2
                             active:scale-[0.98] shadow-sm hover:shadow-md flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Product
                  </button>
                </div>
              )}

              {userRole && (
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1.5 rounded-full text-sm font-medium text-white ${getRoleColor()}`}
                  >
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                  </span>
                  <div className="h-6 w-px bg-gray-200"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Original Add Product Modal */}
      {showAddProductModal && (
        <AddProductModal
          isOpen={showAddProductModal}
          onClose={() => setShowAddProductModal(false)}
          onProductAdded={handleProductAdded}
          sellerId={sellerId}
        />
      )}

      {/* New Product Management Modal */}
      {showProductManagementModal && (
        <ProductManagementModal
          isOpen={showProductManagementModal}
          onClose={() => setShowProductManagementModal(false)}
          sellerId={sellerId}
          onProductAdded={handleProductManaged}
        />
      )}
    </>
  );
}
