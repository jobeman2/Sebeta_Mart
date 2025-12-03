"use client";

import { useEffect, useState } from "react";

interface Order {
  order_id: number;
  product_id: number;
  seller_id: number;
  quantity: number;
  total_price: string;
  status: string;
  delivery_id: number | null;
  delivery_name: string | null;
  delivery_phone: string | null;
}

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/buyer/orders", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setOrders(data.orders);
      })
      .catch(err => setError("Error fetching orders"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading your orders...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!orders.length) return <div className="p-6">No orders yet.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      {orders.map(o => (
        <div key={o.order_id} className="border p-4 rounded shadow flex flex-col gap-2">
          <p><strong>Order ID:</strong> {o.order_id}</p>
          <p><strong>Product ID:</strong> {o.product_id}</p>
          <p><strong>Quantity:</strong> {o.quantity}</p>
          <p><strong>Total:</strong> ${o.total_price}</p>
          <p><strong>Status:</strong> {o.status}</p>
          {o.delivery_id ? (
            <>
              <p><strong>Delivery:</strong> {o.delivery_name}</p>
              <p><strong>Phone:</strong> {o.delivery_phone}</p>
            </>
          ) : (
            <p>Delivery not assigned yet.</p>
          )}
        </div>
      ))}
    </div>
  );
}
