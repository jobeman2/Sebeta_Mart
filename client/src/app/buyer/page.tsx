"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

interface Order {
  order_id: number;
  product_id: number;
  seller_id: number;
  quantity: number;
  total_price: string;
  status: string;
  delivery_id: number | null;
  vehicle_type: string | null;
  delivery_name: string | null;
  delivery_phone: string | null;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
}

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch orders and favorites
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Orders
        const ordersRes = await fetch("http://localhost:5000/buyer/orders", {
          credentials: "include",
        });
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders);

        // Favorites
        const favRes = await fetch("http://localhost:5000/buyer/favorites", {
          credentials: "include",
        });
        const favData = await favRes.json();
        setFavorites(favData.map((f: any) => f.product_id));
      } catch (err) {
        console.error("Error fetching orders/favorites:", err);
        setError("Error fetching orders or favorites");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Toggle favorite
  const toggleFavorite = async (productId: number) => {
    try {
      const isFavorite = favorites.includes(productId);
      const url = isFavorite
        ? "http://localhost:5000/buyer/favorites/remove"
        : "http://localhost:5000/buyer/favorites/add";

      const options: RequestInit = {
        method: isFavorite ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
        credentials: "include",
      };

      const res = await fetch(url, options);
      const data = await res.json();
      console.log("Favorite response:", data);

      if (res.ok) {
        setFavorites(prev =>
          isFavorite ? prev.filter(id => id !== productId) : [...prev, productId]
        );
      } else {
        alert(data.message || "Failed to update favorites");
      }
    } catch (err) {
      console.error("Error updating favorites:", err);
      alert("Error updating favorites");
    }
  };

  if (loading) return <div className="p-6">Loading your orders...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!orders.length) return <div className="p-6">No orders yet.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>

      {orders.map(o => (
        <div key={o.order_id} className="border p-4 rounded shadow flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div>
              <p><strong>Order ID:</strong> {o.order_id}</p>
              <p><strong>Product ID:</strong> {o.product_id}</p>
              <p><strong>Quantity:</strong> {o.quantity}</p>
              <p><strong>Total Price:</strong> {o.total_price} ETB</p>
              <p><strong>Status:</strong> {o.status}</p>
            </div>

            {/* Favorite Heart */}
            <button
              onClick={() => toggleFavorite(o.product_id)}
              className="p-2"
              aria-label="Toggle Favorite"
            >
              <Heart
                className={`w-6 h-6 transition-transform duration-150 ${
                  favorites.includes(o.product_id)
                    ? "text-red-500 scale-110"
                    : "text-gray-400"
                }`}
              />
            </button>
          </div>

          {o.delivery_id ? (
            <div className="mt-2 p-3 border rounded bg-gray-50">
              <p><strong>Delivery Person:</strong> {o.delivery_name}</p>
              <p><strong>Phone:</strong> {o.delivery_phone}</p>
              <p><strong>Vehicle:</strong> {o.vehicle_type || "N/A"}</p>

              {o.delivery_latitude && o.delivery_longitude ? (
                <p className="text-green-600 font-semibold">
                  Delivery is on the way 🚚
                </p>
              ) : (
                <p className="text-gray-600">Waiting for delivery location…</p>
              )}
            </div>
          ) : (
            <p className="text-gray-600">Delivery not assigned yet.</p>
          )}
        </div>
      ))}
    </div>
  );
}
