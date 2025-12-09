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
  const [deliveryUsers, setDeliveryUsers] = useState<any[]>([]);
  const [assigning, setAssigning] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch single order and its delivery users
  const fetchOrder = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/singleOrder/${id}`, {
        credentials: "include",
      });

      // Check if response is OK
      if (!res.ok) {
        if (res.status === 404) {
          setError("Order not found");
        } else {
          setError(`Error: ${res.status} ${res.statusText}`);
        }
        setOrder(null);
        return;
      }

      const data = await res.json();
      
      // Debug: Check what's in the response
      console.log("API Response:", data);
      console.log("Order data:", data.order);
      console.log("Delivery users:", data.deliveryUsers);
      
      // Make sure we have the order data
      if (!data.order) {
        setError("Order data not found in response");
        return;
      }

      setOrder(data.order);
      setDeliveryUsers(data.deliveryUsers || []);

    } catch (err: any) {
      console.error("Error loading order:", err);
      setError("Failed to load order. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  // Confirm payment
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
      alert(err.message || "Error confirming payment");
    } finally {
      setConfirmingPayment(false);
    }
  };

  // Assign delivery person
  const handleAssignDelivery = async (deliveryUserId: any) => {
    if (!deliveryUserId && deliveryUserId !== 0) {
      alert("Error: Delivery person ID is invalid!");
      return;
    }

    const deliveryIdNum = Number(deliveryUserId);
    
    if (isNaN(deliveryIdNum)) {
      alert("Error: Delivery person ID must be a valid number!");
      return;
    }

    setAssigning(deliveryIdNum);

    try {
      const res = await fetch(
        `http://localhost:5000/singleOrder/${id}/assign-delivery`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ delivery_id: deliveryIdNum }),
        }
      );

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Failed to assign delivery");

      alert("Delivery person assigned successfully!");
      fetchOrder();
    } catch (err: any) {
      alert(err.message || "Error assigning delivery");
    } finally {
      setAssigning(null);
    }
  };

  // Loading states
  if (loading || authLoading) {
    return (
      <div className="p-6 text-gray-700">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
          <p className="text-sm text-gray-600 mt-2">Order ID: {id}</p>
          <button
            onClick={fetchOrder}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Order not found state
  if (!order) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Order Not Found</h3>
          <p className="text-yellow-600">The order with ID "{id}" could not be found.</p>
          <p className="text-sm text-gray-600 mt-2">Please check the order ID and try again.</p>
        </div>
      </div>
    );
  }

  // Conditions
  const showConfirmButton =
    order.payment_method === "telebirr" &&
    order.payment_status !== "payment_confirmed" &&
    !!order.telebirr_txn_number;

  const showAssignDelivery =
    order.payment_status === "payment_confirmed" &&
    !order.delivery_id;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Order #{order.order_id}</h1>

      {/* Product Info */}
      <div className="bg-white shadow p-4 rounded mb-4 flex gap-4">
        {order.product_image && (
          <img
            src={order.product_image}
            className="w-32 h-32 rounded object-cover"
            alt={order.product_name}
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

      {/* Buyer Info */}
      <div className="bg-white shadow p-4 rounded mb-4">
        <h3 className="text-lg font-semibold mb-2">Buyer Information</h3>
        <p>Name: {order.buyer_name}</p>
        <p>Email: {order.buyer_email}</p>
        <p>Phone: {order.buyer_phone}</p>
      </div>

      {/* Order Status */}
      <div className="bg-white shadow p-4 rounded mb-4">
        <h3 className="text-lg font-semibold mb-2">Order Status</h3>
        <p>Status: {order.status}</p>
        <p>Placed On: {new Date(order.created_at).toLocaleString()}</p>
      </div>

      {/* Payment Info */}
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
                alt="Telebirr payment screenshot"
              />
            )}
          </>
        )}

        {showConfirmButton && (
          <button
            onClick={handleConfirmPayment}
            disabled={confirmingPayment}
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            {confirmingPayment ? "Confirming..." : "Confirm Payment"}
          </button>
        )}
      </div>

      {/* Assign Delivery */}
      {showAssignDelivery && (
        <div className="bg-white shadow p-4 rounded mb-4">
          <h3 className="text-lg font-semibold mb-4">Assign Delivery Person</h3>

          <div className="grid grid-cols-1 gap-4">
            {deliveryUsers.length > 0 ? (
              deliveryUsers.map((d) => (
                <div
                  key={d.delivery_id}
                  className="flex justify-between items-center border p-4 rounded"
                >
                  <div>
                    <p className="font-semibold">{d.full_name}</p>
                    <p className="text-sm text-gray-500">{d.email}</p>
                    <p className="text-xs text-gray-400">ID: {d.delivery_id}</p>
                  </div>

                  <button
                    onClick={() => handleAssignDelivery(d.delivery_id)}
                    disabled={assigning === Number(d.delivery_id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {assigning === Number(d.delivery_id) ? "Assigning..." : "Assign"}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No delivery users found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}