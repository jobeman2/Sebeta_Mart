"use client";
import { useEffect, useState } from "react";

interface Order {
  user_id: number;
  product_id: number;
  seller_id: number;
  quantity: number;
  total_price: number;
  status: string;
  delivery_id: number | null;
  customer_name: string;
  customer_phone: string;
}

export default function DeliveryAssignments() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch unassigned orders
  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/delivery/assignments", {
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

  // Assign an order to logged-in delivery person
  const assignOrder = async (productId: number) => {
    try {
      const res = await fetch(`http://localhost:5000/delivery/assign/${productId}`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Error assigning order");
      } else {
        const data = await res.json();
        alert("Order assigned successfully!");
        // Refresh order list
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
      alert("Server error assigning order");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  if (!orders.length) return <div>No unassigned orders available.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded flex flex-col gap-4">
      <h1 className="text-2xl font-bold mb-4">Unassigned Orders</h1>
      {orders.map((order) => (
        <div key={order.product_id} className="border p-4 rounded flex flex-col gap-2">
          <p><strong>Customer:</strong> {order.customer_name}</p>
          <p><strong>Phone:</strong> {order.customer_phone}</p>
          <p><strong>Quantity:</strong> {order.quantity}</p>
          <p><strong>Total Price:</strong> ${order.total_price}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <button
            onClick={() => assignOrder(order.product_id)}
            className="px-4 py-2 mt-2 bg-blue-600 text-white rounded"
          >
            Accept Order
          </button>
        </div>
      ))}
    </div>
  );
}
