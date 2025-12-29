"use client";

import { useEffect, useState } from "react";

interface Order {
  order_id: number;
  product_id: number;
  buyer_name: string;
  buyer_phone: string;
  quantity: number;
  total_price: string;
  status: string;
  delivery_id: number | null;
  delivery_name?: string;
  delivery_phone?: string;
  vehicle_type?: string;
  plate_number?: string;
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSellerOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/seller/orders", {
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to load orders");
        setOrders([]);
      } else {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
      setError("Server error fetching orders");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSellerOrders();
  }, []);

  if (loading) return <div className="p-6">Loading orders...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!orders.length) return <div className="p-6">No orders yet.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold mb-4">Seller Orders</h1>

      {orders.map((order) => (
        <div
          key={order.order_id}
          className="border rounded p-4 shadow-sm bg-white flex flex-col gap-2"
        >
          <p><strong>Order ID:</strong> {order.order_id}</p>
          <p><strong>Buyer:</strong> {order.buyer_name}</p>
          <p><strong>Phone:</strong> {order.buyer_phone}</p>
          <p><strong>Quantity:</strong> {order.quantity}</p>
          <p><strong>Total Price:</strong> ${order.total_price}</p>
          <p><strong>Status:</strong> {order.status}</p>

          {order.delivery_id ? (
            <div className="text-green-600 font-semibold">
              <p>Delivery Assigned</p>
              <p><strong>Name:</strong> {order.delivery_name}</p>
              <p><strong>Phone:</strong> {order.delivery_phone}</p>
              <p><strong>Vehicle:</strong> {order.vehicle_type} ({order.plate_number})</p>
            </div>
          ) : (
            <p className="text-red-600 font-semibold">
              No delivery assigned yet
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
