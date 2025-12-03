"use client";

import { useState, useEffect, useContext } from "react";
import { useParams } from "next/navigation";
import { AuthContext } from "@/context/Authcontext"; // adjust path if needed

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
  const [subCityId, setSubCityId] = useState<number | "">(""); // store subcity ID
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [orderMessage, setOrderMessage] = useState("");
  const [userSellerId, setUserSellerId] = useState<number | null>(null);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/product/${id}`);
        if (!res.ok) {
          setError("Failed to fetch product.");
          return;
        }
        const data = await res.json();
        ["image_url", "image_url1", "image_url2", "image_url3"].forEach((key) => {
          if (data[key] && !data[key].startsWith("http")) {
            data[key] = `http://localhost:5000/${data[key].replace(/\\/g, "/")}`;
          }
        });
        setProduct(data);
      } catch (err) {
        console.error(err);
        setError("Server error while fetching product.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Fetch seller ID for logged-in user
  useEffect(() => {
    const fetchUserSellerId = async () => {
      if (!user) return;
      try {
        const res = await fetch(`http://localhost:5000/sellers/user/${user.id}`);
        if (!res.ok) return;
        const data = await res.json();
        setUserSellerId(data?.seller_id || null);
      } catch (err) {
        console.error("Failed to fetch user seller ID", err);
      }
    };
    fetchUserSellerId();
  }, [user]);

  // Fetch subcities
  useEffect(() => {
    const fetchSubCities = async () => {
      try {
        const res = await fetch("http://localhost:5000/subcities");
        const data = await res.json();
        setSubCities(data.subcities || []);
      } catch (err) {
        console.error("Failed to fetch subcities", err);
      }
    };
    fetchSubCities();
  }, []);

  // Auto-detect user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toString());
          setLongitude(pos.coords.longitude.toString());
        },
        (err) => console.error("Geolocation error:", err)
      );
    }
  }, []);

  // Handle order
  const handleOrder = async () => {
    if (!user) {
      setOrderMessage("Please log in to place an order.");
      return;
    }
    if (userSellerId && product && userSellerId === product.seller_id) {
      setOrderMessage("You cannot order your own product.");
      return;
    }
    if (!subCityId || !region || !city) {
      setOrderMessage("Please fill all location fields.");
      return;
    }
    if (!latitude || !longitude) {
      setOrderMessage("Unable to detect your location.");
      return;
    }

    try {
      setOrderMessage("Placing order...");
      const res = await fetch("http://localhost:5000/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          product_id: product.id,
          quantity,
          subcity_id: subCityId, // send ID
          city,
          region,
          latitude,
          longitude,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Order failed");
      setOrderMessage(`Order placed successfully! Order ID: ${data.order.id}`);
    } catch (err: any) {
      console.error(err);
      setOrderMessage(err.message || "Error placing order.");
    }
  };

  if (loading || authLoading) return <p className="p-6 text-gray-600">Loading product...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!product) return <p className="p-6 text-gray-600">Product not found.</p>;

  const images = [product.image_url, product.image_url1, product.image_url2, product.image_url3].filter(Boolean);
  const isOwnProduct = userSellerId && userSellerId === product.seller_id;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Images */}
        <div className="flex flex-col gap-4">
          {images.length > 0 ? (
            images.map((img, idx) => (
              <img key={idx} src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-64 object-cover rounded-lg" />
            ))
          ) : (
            <div className="w-full h-64 flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg">
              No images available
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-[#EF837B] font-semibold text-xl">ETB {product.price}</p>
          <p className="text-gray-600">{product.description}</p>
          <p className="text-gray-700">Stock: {product.stock}</p>

          {/* Location inputs */}
          <div className="flex flex-col gap-2 mt-4">
            <select
              value={subCityId}
              onChange={(e) => setSubCityId(Number(e.target.value))}
              className="border border-gray-300 rounded p-2"
            >
              <option value="">Select Sub-city</option>
              {subCities.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="border border-gray-300 rounded p-2"
            />
            <input
              type="text"
              placeholder="Region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="border border-gray-300 rounded p-2"
            />

            <input type="text" placeholder="Latitude" value={latitude} readOnly className="bg-gray-100 border border-gray-300 rounded p-2" />
            <input type="text" placeholder="Longitude" value={longitude} readOnly className="bg-gray-100 border border-gray-300 rounded p-2" />
          </div>

          {/* Order section */}
          <div className="mt-4 flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-20 border border-gray-300 rounded p-1"
            />
            <button
              onClick={handleOrder}
              disabled={!user || isOwnProduct}
              className={`px-4 py-2 rounded ${!user || isOwnProduct ? "bg-gray-400 cursor-not-allowed" : "bg-[#EF837B] hover:bg-[#d56a61]"}`}
            >
              Order Now
            </button>
          </div>

          {isOwnProduct && <p className="text-red-500 mt-2">You cannot order your own product.</p>}
          {orderMessage && (
            <p className={`mt-2 ${orderMessage.includes("successfully") ? "text-green-600" : "text-red-500"}`}>
              {orderMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
