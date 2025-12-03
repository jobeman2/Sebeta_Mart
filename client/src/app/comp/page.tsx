"use client";

import { useEffect, useState } from "react";

interface Order {
  order_id: number;
  user_id: number;
  product_id: number;
  seller_id: number;
  quantity: number;
  total_price: string;
  status: string;
  delivery_id: number | null;
  customer_name: string;
  customer_phone: string;
}

export default function AssignedOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch assigned orders
  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/delivery/complete", {
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Error fetching orders");
        setOrders([]);
      } else {
        const data = await res.json();
        setOrders(data.orders);
      }
    } catch (err) {
      console.error(err);
      setError("Server error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  // Mark order as delivered
  const completeOrder = async (orderId: number) => {
    try {
      const res = await fetch("http://localhost:5000/delivery/complete", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ order_id: orderId }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Error updating order");
      } else {
        alert("Order marked as delivered!");
        fetchOrders(); // Refresh list
      }
    } catch (err) {
      console.error(err);
      alert("Server error updating order");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div className="p-6">Loading assigned orders...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!orders.length) return <div className="p-6">No assigned orders at the moment.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold mb-4">Assigned Orders</h1>
      {orders.map((order) => (
        <div key={order.order_id} className="border p-4 rounded shadow flex flex-col gap-2">
          <p><strong>Customer:</strong> {order.customer_name}</p>
          <p><strong>Phone:</strong> {order.customer_phone}</p>
          <p><strong>Quantity:</strong> {order.quantity}</p>
          <p><strong>Total Price:</strong> ${order.total_price}</p>
          <p><strong>Status:</strong> {order.status}</p>

          {order.status !== "delivered" && (
            <button
              onClick={() => completeOrder(order.order_id)}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Mark as Delivered
            </button>
          )}

          {order.status === "delivered" && (
            <span className="mt-2 px-4 py-2 bg-gray-300 text-gray-700 rounded">Delivered</span>
          )}
        </div>
      ))}
    </div>
  );
}
