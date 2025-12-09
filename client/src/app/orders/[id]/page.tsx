"use client";

import { useEffect, useState, useContext } from "react";
import { useParams } from "next/navigation";
import { AuthContext } from "@/context/Authcontext";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useContext(AuthContext);

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmingPayment, setConfirmingPayment] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;

    setLoading(true);

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

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleConfirmPayment = async () => {
    if (!order) return;

    setConfirmingPayment(true);

    try {
      const res = await fetch(
        `http://localhost:5000/singleOrder/confirm-payment/${id}`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to confirm payment");

      alert("Payment confirmed successfully!");

      fetchOrder();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setConfirmingPayment(false);
    }
  };

  if (loading || authLoading)
    return <div className="p-6 text-gray-700">Loading order...</div>;

  if (!order)
    return <div className="p-6 text-red-600">Order not found.</div>;

  const isSeller = user && user.id === order.seller_id;

  const showConfirmButton =
    isSeller &&
    order.payment_method === "telebirr" &&
    order.payment_status === "pending";

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Order #{order.order_id}</h1>

      {/* Product */}
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
          <p className="font-semibold mt-1">Total: ETB {order.total_price}</p>
        </div>
      </div>

      {/* Buyer */}
      <div className="bg-white shadow p-4 rounded mb-4">
        <h3 className="text-lg font-semibold mb-2">Buyer Information</h3>
        <p>Name: {order.buyer_name}</p>
        <p>Email: {order.buyer_email}</p>
        <p>Phone: {order.buyer_phone}</p>
      </div>

      {/* Status */}
      <div className="bg-white shadow p-4 rounded mb-4">
        <h3 className="text-lg font-semibold mb-2">Order Status</h3>
        <p>Status: {order.status}</p>
        <p>Placed On: {new Date(order.created_at).toLocaleString()}</p>
      </div>

      {/* Payment */}
      <div className="bg-white shadow p-4 rounded mb-4">
        <h3 className="text-lg font-semibold mb-2">Payment Information</h3>

        <p>Method: {order.payment_method}</p>
        <p>Status: {order.payment_status}</p>

        {order.payment_method === "telebirr" && (
          <>
            <p>Transaction Number: {order.telebirr_txn_number || "N/A"}</p>
            {order.telebirr_screenshot && (
              <img
                src={order.telebirr_screenshot}
                className="w-48 h-48 object-cover mt-2 border rounded"
              />
            )}
          </>
        )}

        {showConfirmButton && (
          <button
            onClick={handleConfirmPayment}
            disabled={confirmingPayment}
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {confirmingPayment ? "Confirming..." : "Confirm Payment"}
          </button>
        )}
      </div>
    </div>
  );
}
