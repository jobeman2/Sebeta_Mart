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
} from "lucide-react";

interface SubCity {
  id: number;
  name: string;
}

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
  const [orderMessage, setOrderMessage] = useState("");
  const [userSellerId, setUserSellerId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "telebirr">("cod");
  const [telebirrTxn, setTelebirrTxn] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isCompared, setIsCompared] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

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

  const handleOrder = useCallback(async () => {
    if (!user) {
      setOrderMessage("Please log in to place an order.");
      return;
    }
    if (isOwnProduct) {
      setOrderMessage("You cannot order your own product.");
      return;
    }
    if (!selectedSubCity || !region || !city) {
      setOrderMessage("Please fill all location fields.");
      return;
    }
    if (!latitude || !longitude) {
      setOrderMessage("Unable to detect your location.");
      return;
    }
    if (paymentMethod === "telebirr" && !telebirrTxn) {
      setOrderMessage("Please enter TeleBirr transaction number.");
      return;
    }

    try {
      setOrderMessage("Placing order...");

      const formData = new FormData();
      formData.append("product_id", product.id);
      formData.append("quantity", quantity.toString());
      formData.append("subcity_id", selectedSubCity.id.toString());
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

      setOrderMessage(`Order placed successfully! Order ID: ${data.order.id}`);
      setTelebirrTxn("");
      setScreenshot(null);
    } catch (err: any) {
      console.error(err);
      setOrderMessage(err.message || "Error placing order.");
    }
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
    screenshot,
    product,
    quantity,
  ]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse w-full max-w-7xl mx-auto px-4">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8 mx-auto"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="h-[500px] bg-gray-200 rounded-xl"></div>
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Error Loading Product
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <a
                href="/products"
                className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Product Not Found
              </h3>
              <p className="text-gray-600 mb-6">
                The product you're looking for doesn't exist or has been
                removed.
              </p>
              <a
                href="/products"
                className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Browse Products
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <a
                href="/"
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                Home
              </a>
              <span className="text-gray-400">/</span>
              <a
                href="/products"
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                Products
              </a>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium truncate max-w-xs">
                {product.name}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button className="flex items-center text-gray-500 hover:text-gray-900 text-sm transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span>Prev</span>
              </button>
              <button className="flex items-center text-gray-500 hover:text-gray-900 text-sm transition-colors">
                <span>Next</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images Section */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                {images.length > 0 ? (
                  <img
                    src={images[activeImage]}
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <div className="text-center p-8">
                    <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImage === idx
                          ? "border-amber-600 shadow-sm"
                          : "border-gray-200 hover:border-gray-300"
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
                <h1 className="text-3xl font-semibold text-gray-900 mb-2">
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
                              ? "text-amber-500 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      (2 reviews)
                    </span>
                  </div>

                  {product.stock > 0 ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      In Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Out of Stock
                    </span>
                  )}
                </div>

                <div className="text-4xl font-bold text-amber-600 mb-6">
                  ETB {product.price}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description || "No description available."}
                </p>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Color
                </label>
                <div className="flex space-x-3">
                  {images.slice(0, 2).map((img, idx) => (
                    <button
                      key={idx}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 ${
                        idx === 0 ? "border-amber-600" : "border-gray-300"
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
                <label className="block text-sm font-medium text-gray-700">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="Region"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Quantity and Price */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
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
                      className="w-20 text-center border-x border-gray-300 py-3 focus:outline-none"
                    />
                    <button
                      onClick={() =>
                        setQuantity((q) => Math.min(product.stock, q + 1))
                      }
                      className="px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-lg font-medium text-gray-900">
                    Subtotal:{" "}
                    <span className="text-amber-600">
                      ETB {(parseFloat(product.price) * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Payment Method
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod("cod")}
                    className={`flex items-center justify-center space-x-2 px-4 py-3 border rounded-lg transition-colors ${
                      paymentMethod === "cod"
                        ? "border-amber-600 bg-amber-50 text-amber-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <Truck className="w-5 h-5" />
                    <span>Cash on Delivery</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("telebirr")}
                    className={`flex items-center justify-center space-x-2 px-4 py-3 border rounded-lg transition-colors ${
                      paymentMethod === "telebirr"
                        ? "border-amber-600 bg-amber-50 text-amber-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <Shield className="w-5 h-5" />
                    <span>TeleBirr</span>
                  </button>
                </div>
              </div>

              {/* TeleBirr Details */}
              {paymentMethod === "telebirr" && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TeleBirr Transaction Number *
                    </label>
                    <input
                      type="text"
                      value={telebirrTxn}
                      onChange={(e) => setTelebirrTxn(e.target.value)}
                      placeholder="Enter transaction number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Screenshot (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setScreenshot(e.target.files?.[0] || null)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                  </div>
                </div>
              )}

              {/* Location Coordinates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={latitude}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    placeholder="Auto-detected"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={longitude}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    placeholder="Auto-detected"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4">
                <button
                  onClick={handleOrder}
                  disabled={!user || isOwnProduct || product.stock === 0}
                  className={`w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-lg font-medium text-white transition-colors mb-4 ${
                    !user || isOwnProduct || product.stock === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-amber-600 hover:bg-amber-700"
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
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                      isWishlisted
                        ? "border-amber-600 text-amber-600"
                        : "border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    <Heart className="w-5 h-5" />
                    <span>Wishlist</span>
                  </button>

                  <button
                    onClick={() => setIsCompared(!isCompared)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                      isCompared
                        ? "border-amber-600 text-amber-600"
                        : "border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Compare</span>
                  </button>
                </div>
              </div>

              {/* Order Messages */}
              {orderMessage && (
                <div
                  className={`p-4 rounded-lg ${
                    orderMessage.includes("successfully")
                      ? "bg-green-50 border border-green-200 text-green-700"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {orderMessage.includes("successfully") ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    <p className="text-sm">{orderMessage}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: "description", label: "Description" },
                { id: "information", label: "Additional Information" },
                { id: "shipping", label: "Shipping & Returns" },
                { id: "reviews", label: "Reviews" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-amber-600 text-amber-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {/* Description Tab */}
            {activeTab === "description" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Product Information
                </h3>
                <div className="prose prose-lg max-w-none text-gray-600">
                  <p>
                    {product.description ||
                      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Premium quality materials</li>
                    <li>Expert craftsmanship</li>
                    <li>Durable construction</li>
                    <li>Easy to maintain</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Additional Information Tab */}
            {activeTab === "information" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    Specifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Material</span>
                        <span className="font-medium">Premium Fabric</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Color</span>
                        <span className="font-medium">As shown</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Size</span>
                        <span className="font-medium">Standard</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Weight</span>
                        <span className="font-medium">1.2 kg</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Dimensions</span>
                        <span className="font-medium">30 × 40 × 10 cm</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Warranty</span>
                        <span className="font-medium">1 Year</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping & Returns Tab */}
            {activeTab === "shipping" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    Delivery Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <Truck className="w-8 h-8 text-amber-600 mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Standard Shipping
                      </h4>
                      <p className="text-gray-600 text-sm">3-5 business days</p>
                      <p className="text-gray-600 text-sm">ETB 50.00</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <Truck className="w-8 h-8 text-amber-600 mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Express Shipping
                      </h4>
                      <p className="text-gray-600 text-sm">1-2 business days</p>
                      <p className="text-gray-600 text-sm">ETB 100.00</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <MapPin className="w-8 h-8 text-amber-600 mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Store Pickup
                      </h4>
                      <p className="text-gray-600 text-sm">Same day pickup</p>
                      <p className="text-gray-600 text-sm">Free</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    Return Policy
                  </h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-6 h-6 text-amber-600 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          30-Day Return Policy
                        </h4>
                        <p className="text-gray-600">
                          We offer a 30-day return policy for all products.
                          Items must be in original condition with all tags
                          attached. Refunds will be processed within 5-7
                          business days after we receive the returned item.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="space-y-8">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Customer Reviews
                </h3>

                <div className="space-y-6">
                  {/* Review 1 */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Sarah M.
                        </h4>
                        <div className="flex items-center mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${
                                  i < 4
                                    ? "text-amber-500 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-500">
                            2 days ago
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600">
                      "Excellent product! The quality exceeded my expectations.
                      Fast shipping and great customer service."
                    </p>
                  </div>

                  {/* Review 2 */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">John D.</h4>
                        <div className="flex items-center mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${
                                  i < 5
                                    ? "text-amber-500 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-500">
                            1 week ago
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600">
                      "Perfect fit and great quality. Would definitely recommend
                      to friends and family!"
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
