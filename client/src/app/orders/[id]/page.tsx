"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(`http://localhost:5000/singleOrder/${id}`, {
          credentials: "include",
        });
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error("Error loading order", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return <div className="p-6 text-gray-700">Loading order...</div>;
  }

  if (!order) {
    return <div className="p-6 text-red-600">Order not found.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Order #{order.order_id}</h1>

      <div className="bg-white shadow p-4 rounded mb-4 flex gap-4">
        {order.product_image && (
          <img
            src={order.product_image}
            className="w-32 h-32 rounded object-cover"
          />
        )}
        <div>
          <h2 className="text-xl font-semibold">{order.product_name}</h2>
          <p className="text-gray-600">{order.product_description}</p>
          <p className="mt-2">Price: ETB {order.product_price}</p>
          <p>Quantity: {order.quantity}</p>
          <p className="font-semibold mt-1">
            Total: ETB {order.total_price}
          </p>
        </div>
      </div>

      <div className="bg-white shadow p-4 rounded mb-4">
        <h3 className="text-lg font-semibold mb-2">Buyer Information</h3>
        <p>Name: {order.buyer_name}</p>
        <p>Email: {order.buyer_email}</p>
        <p>Phone: {order.buyer_phone}</p>
      </div>

      <div className="bg-white shadow p-4 rounded">
        <h3 className="text-lg font-semibold mb-2">Order Status</h3>
        <p>Status: {order.status}</p>
        <p>Placed On: {new Date(order.created_at).toLocaleString()}</p>
      </div>
    </div>
  );
}
