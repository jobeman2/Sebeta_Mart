"use client";

import { useState, useEffect, useContext, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { AuthContext } from "@/context/Authcontext";
import {
  ShoppingCart,
  Heart,
  Star,
  Package,
  Truck,
  CreditCard,
  RefreshCw,
  Shield,
  AlertCircle,
  CheckCircle,
  Camera,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  Receipt,
  Calculator,
} from "lucide-react";

interface SubCity {
  id: number;
  name: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

// Tax rate (15%)
const TAX_RATE = 0.15;

// Calculate price with tax
const calculatePriceWithTax = (price: string | number) => {
  const basePrice = typeof price === "string" ? parseFloat(price) : price;
  const tax = basePrice * TAX_RATE;
  const totalWithTax = basePrice + tax;
  return {
    basePrice: basePrice.toFixed(2),
    tax: tax.toFixed(2),
    totalWithTax: totalWithTax.toFixed(2),
  };
};

export default function ProductPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useContext(AuthContext);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [subCities, setSubCities] = useState<SubCity[]>([]);
  const [selectedSubCity, setSelectedSubCity] = useState<SubCity | null>(null);
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [userSellerId, setUserSellerId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "telebirr">("cod");
  const [telebirrTxn, setTelebirrTxn] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isCompared, setIsCompared] = useState(false);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [orderProcessing, setOrderProcessing] = useState(false);

  // Calculate prices with tax
  const priceDetails = useMemo(() => {
    if (!product) return null;
    return calculatePriceWithTax(product.price);
  }, [product]);

  const subtotalPrice = useMemo(() => {
    if (!priceDetails) return "0.00";
    const subtotal = parseFloat(priceDetails.basePrice) * quantity;
    return subtotal.toFixed(2);
  }, [priceDetails, quantity]);

  const subtotalTax = useMemo(() => {
    if (!priceDetails) return "0.00";
    const tax = parseFloat(priceDetails.tax) * quantity;
    return tax.toFixed(2);
  }, [priceDetails, quantity]);

  const subtotalWithTax = useMemo(() => {
    if (!priceDetails) return "0.00";
    const total = parseFloat(priceDetails.totalWithTax) * quantity;
    return total.toFixed(2);
  }, [priceDetails, quantity]);

  // Add toast notification
  const addToast = useCallback((message: string, type: Toast["type"]) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove toast after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  // Remove toast
  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Fetch product, subcities, and user seller ID concurrently
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resProduct, resSubcities, resUserSeller] = await Promise.all([
          fetch(`http://localhost:5000/product/${id}`),
          fetch("http://localhost:5000/subcities"),
          user
            ? fetch(`http://localhost:5000/sellers/user/${user.id}`)
            : Promise.resolve({ ok: false, json: async () => ({}) }),
        ]);

        if (!resProduct.ok) {
          setError("Failed to fetch product.");
          return;
        }
        const dataProduct = await resProduct.json();
        ["image_url", "image_url1", "image_url2", "image_url3"].forEach(
          (key) => {
            if (dataProduct[key] && !dataProduct[key].startsWith("http")) {
              dataProduct[key] = `http://localhost:5000/${dataProduct[
                key
              ].replace(/\\/g, "/")}`;
            }
          }
        );
        setProduct(dataProduct);

        const dataSubcities = await resSubcities.json();
        setSubCities(dataSubcities.subcities || []);
        if (dataSubcities.subcities?.length > 0) {
          setSelectedSubCity(dataSubcities.subcities[0]);
        }

        if (resUserSeller.ok) {
          const dataUserSeller = await resUserSeller.json();
          setUserSellerId(dataUserSeller?.seller_id || null);
        }
      } catch (err) {
        console.error(err);
        setError("Server error while fetching data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  // Auto-detect user's location once
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toFixed(6));
          setLongitude(pos.coords.longitude.toFixed(6));
        },
        (err) => console.error("Geolocation error:", err)
      );
    }
  }, []);

  const images = useMemo(
    () =>
      [
        product?.image_url,
        product?.image_url1,
        product?.image_url2,
        product?.image_url3,
      ].filter(Boolean),
    [product]
  );

  const isOwnProduct = useMemo(
    () => userSellerId && product && userSellerId === product.seller_id,
    [userSellerId, product]
  );

  const validateOrder = useCallback(() => {
    if (!user) {
      addToast("Please log in to place an order.", "error");
      return false;
    }
    if (isOwnProduct) {
      addToast("You cannot order your own product.", "error");
      return false;
    }
    if (!selectedSubCity) {
      addToast("Please select a sub-city.", "error");
      return false;
    }
    if (!region.trim()) {
      addToast("Please enter your region.", "error");
      return false;
    }
    if (!city.trim()) {
      addToast("Please enter your city.", "error");
      return false;
    }
    if (!latitude || !longitude) {
      addToast("Unable to detect your location.", "error");
      return false;
    }
    if (paymentMethod === "telebirr" && !telebirrTxn.trim()) {
      addToast("Please enter TeleBirr transaction number.", "error");
      return false;
    }
    return true;
  }, [
    user,
    isOwnProduct,
    selectedSubCity,
    region,
    city,
    latitude,
    longitude,
    paymentMethod,
    telebirrTxn,
    addToast,
  ]);

  const handleOrderSubmit = useCallback(async () => {
    if (!validateOrder()) return;

    setOrderProcessing(true);
    try {
      addToast("Placing order...", "info");

      const formData = new FormData();
      formData.append("product_id", product.id.toString());
      formData.append("quantity", quantity.toString());
      formData.append("total_price", subtotalWithTax); // Send total with tax
      formData.append("subcity_id", selectedSubCity!.id.toString());
      formData.append("city", city);
      formData.append("region", region);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      formData.append("payment_method", paymentMethod);
      if (paymentMethod === "telebirr") {
        formData.append("telebirr_txn_number", telebirrTxn);
        if (screenshot) formData.append("screenshot", screenshot);
      }

      const res = await fetch("http://localhost:5000/orders", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Order failed");

      addToast(
        `Order placed successfully! Order ID: ${data.order.id}`,
        "success"
      );
      setTelebirrTxn("");
      setScreenshot(null);
      setShowOrderConfirmation(false);
      setOrderProcessing(false);
    } catch (err: any) {
      console.error(err);
      addToast(err.message || "Error placing order.", "error");
      setOrderProcessing(false);
    }
  }, [
    validateOrder,
    product,
    quantity,
    subtotalWithTax,
    selectedSubCity,
    city,
    region,
    latitude,
    longitude,
    paymentMethod,
    telebirrTxn,
    screenshot,
    addToast,
  ]);

  const handleOrderClick = useCallback(() => {
    if (validateOrder()) {
      setShowOrderConfirmation(true);
    }
  }, [validateOrder]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse w-full max-w-7xl mx-auto px-4">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8 mx-auto"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="h-[500px] bg-gray-200 rounded-lg"></div>
            <div className="space-y-6">
              <div className="h-10 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-14 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white border border-gray-300 p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 border border-red-200">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Error Loading Product
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <a
                href="/products"
                className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors font-medium"
              >
                Back to Products
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white border border-gray-300 p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-200">
                <Package className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Product Not Found
              </h3>
              <p className="text-gray-600 mb-6">
                The product you're looking for doesn't exist or has been
                removed.
              </p>
              <a
                href="/products"
                className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors font-medium"
              >
                Browse Products
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Status-based colors
  const statusColors = {
    success: "bg-green-50 border-green-200 text-green-700",
    error: "bg-red-50 border-red-200 text-red-700",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
  };

  const stockStatusColor =
    product.stock > 0
      ? "bg-green-50 border border-green-200 text-green-700"
      : "bg-red-50 border border-red-200 text-red-700";

  const stockStatusIcon = product.stock > 0 ? CheckCircle : AlertCircle;

  return (
    <div className="min-h-screen bg-white">
      {/* Order Confirmation Modal */}
      {showOrderConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Confirm Order</h3>
              <button
                onClick={() => setShowOrderConfirmation(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Product:</span>
                <span className="font-medium">{product.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unit Price:</span>
                <span className="font-medium">
                  ETB {priceDetails?.basePrice}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">VAT (15%):</span>
                <span className="font-medium text-[#EF837B]">
                  + ETB {priceDetails?.tax}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between font-bold">
                  <span>Subtotal:</span>
                  <span>ETB {subtotalPrice}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>VAT on subtotal:</span>
                  <span>ETB {subtotalTax}</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total to Pay:</span>
                  <span className="text-gray-900">ETB {subtotalWithTax}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowOrderConfirmation(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                disabled={orderProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleOrderSubmit}
                disabled={orderProcessing}
                className={`flex-1 px-4 py-3 font-medium ${
                  orderProcessing
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {orderProcessing ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </div>
                ) : (
                  "Confirm Order"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications - Minimal Design */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center justify-between min-w-[300px] max-w-md p-4 border transform transition-all duration-300 animate-slideIn ${
              statusColors[toast.type]
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === "success" ? (
                <CheckCircle className="w-4 h-4" />
              ) : toast.type === "error" ? (
                <AlertCircle className="w-4 h-4" />
              ) : toast.type === "warning" ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>

      {/* Breadcrumb - Minimal */}
      <div className="bg-white border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <a
                href="/"
                className="text-gray-500 hover:text-black transition-colors font-medium"
              >
                Home
              </a>
              <span className="text-gray-400">/</span>
              <a
                href="/products"
                className="text-gray-500 hover:text-black transition-colors font-medium"
              >
                Products
              </a>
              <span className="text-gray-400">/</span>
              <span className="text-black font-medium truncate max-w-xs">
                {product.name}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button className="flex items-center text-gray-500 hover:text-black text-sm transition-colors font-medium">
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span>Prev</span>
              </button>
              <button className="flex items-center text-gray-500 hover:text-black text-sm transition-colors font-medium">
                <span>Next</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images Section */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 border border-gray-300 flex items-center justify-center">
              {images.length > 0 ? (
                <img
                  src={images[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-contain p-8"
                />
              ) : (
                <div className="text-center p-8">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">
                    No image available
                  </p>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 border transition-all ${
                      activeImage === idx
                        ? "border-black"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < 4
                            ? "text-yellow-500 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600 font-medium">
                    (2 reviews)
                  </span>
                </div>

                <span
                  className={`inline-flex items-center px-3 py-1 text-sm font-medium ${stockStatusColor}`}
                >
                  <stockStatusIcon className="w-4 h-4 mr-1" />
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              {/* Price Display with Tax */}
              <div className="mb-6 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-4xl font-bold text-gray-900">
                      ETB {priceDetails?.totalWithTax}
                    </p>
                    <p className="text-sm text-gray-500">
                      Total with 15% VAT included
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Receipt className="w-4 h-4" />
                    <span>VAT incl.</span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="flex justify-between">
                    <span>Base Price:</span>
                    <span>ETB {priceDetails?.basePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (15%):</span>
                    <span className="text-[#EF837B]">
                      + ETB {priceDetails?.tax}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-1 mt-1 flex justify-between font-medium">
                    <span>Final Price:</span>
                    <span className="text-gray-900">
                      ETB {priceDetails?.totalWithTax}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Description
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || "No description available."}
              </p>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Color
              </label>
              <div className="flex space-x-3">
                {images.slice(0, 2).map((img, idx) => (
                  <button
                    key={idx}
                    className={`w-12 h-12 border-2 ${
                      idx === 0 ? "border-black" : "border-gray-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt="Color option"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Location Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-900">
                Delivery Location
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <select
                    value={selectedSubCity?.id || ""}
                    onChange={(e) => {
                      const subCity = subCities.find(
                        (sc) => sc.id === parseInt(e.target.value)
                      );
                      setSelectedSubCity(subCity || null);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-0 transition-colors font-medium"
                  >
                    <option value="">Select Sub-city</option>
                    {subCities.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-0 transition-colors font-medium"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="Region"
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-0 transition-colors font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Quantity and Price */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-900">
                Quantity
              </label>
              <div className="flex items-center space-x-6">
                <div className="flex items-center border border-gray-300">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 py-3 text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    min="1"
                    max={product.stock}
                    onChange={(e) =>
                      setQuantity(
                        Math.min(
                          product.stock,
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      )
                    }
                    className="w-20 text-center border-x border-gray-300 py-3 focus:outline-none font-medium"
                  />
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    className="px-4 py-3 text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Quantity Price Summary */}
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">ETB {subtotalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">VAT (15%):</span>
                    <span className="font-medium text-[#EF837B]">
                      + ETB {subtotalTax}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-gray-200 pt-1">
                    <span>Total:</span>
                    <span className="text-lg text-gray-900">
                      ETB {subtotalWithTax}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-900">
                Payment Method
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex items-center justify-center space-x-2 px-4 py-3 border transition-colors ${
                    paymentMethod === "cod"
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-black text-gray-700"
                  }`}
                >
                  <Truck className="w-5 h-5" />
                  <span>Cash on Delivery</span>
                </button>

                <button
                  onClick={() => setPaymentMethod("telebirr")}
                  className={`flex items-center justify-center space-x-2 px-4 py-3 border transition-colors ${
                    paymentMethod === "telebirr"
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-black text-gray-700"
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span>TeleBirr</span>
                </button>
              </div>
            </div>

            {/* TeleBirr Details */}
            {paymentMethod === "telebirr" && (
              <div className="space-y-4 p-4 border border-gray-300">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    TeleBirr Transaction Number *
                  </label>
                  <input
                    type="text"
                    value={telebirrTxn}
                    onChange={(e) => setTelebirrTxn(e.target.value)}
                    placeholder="Enter transaction number"
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-0 transition-colors font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Payment Screenshot (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:ring-0 transition-colors font-medium file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                  />
                </div>
              </div>
            )}

            {/* Location Coordinates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="text"
                  value={latitude}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 bg-gray-50 text-gray-500 font-medium"
                  placeholder="Auto-detected"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="text"
                  value={longitude}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 bg-gray-50 text-gray-500 font-medium"
                  placeholder="Auto-detected"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4">
              <button
                onClick={handleOrderClick}
                disabled={!user || isOwnProduct || product.stock === 0}
                className={`w-full flex items-center justify-center space-x-2 px-6 py-4 font-bold transition-colors mb-4 ${
                  !user || isOwnProduct || product.stock === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>
                  {!user
                    ? "Login to Order"
                    : isOwnProduct
                    ? "Your Own Product"
                    : product.stock === 0
                    ? "Out of Stock"
                    : "Add to Cart & Place Order"}
                </span>
              </button>

              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => {
                    setIsWishlisted(!isWishlisted);
                    addToast(
                      isWishlisted
                        ? "Removed from wishlist"
                        : "Added to wishlist",
                      "info"
                    );
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 border transition-colors ${
                    isWishlisted
                      ? "border-red-500 text-red-500"
                      : "border-gray-300 text-gray-700 hover:border-black hover:text-black"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`}
                  />
                  <span>Wishlist</span>
                </button>

                <button
                  onClick={() => {
                    setIsCompared(!isCompared);
                    addToast(
                      isCompared
                        ? "Removed from comparison"
                        : "Added to comparison",
                      "info"
                    );
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 border transition-colors ${
                    isCompared
                      ? "border-blue-500 text-blue-500"
                      : "border-gray-300 text-gray-700 hover:border-black hover:text-black"
                  }`}
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Compare</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
