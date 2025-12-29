"use client";

import { useEffect, useState, useContext } from "react";
import { AuthContext } from "@/context/Authcontext";

export default function AssignDeliveryPage() {
  const { user, loading: authLoading } = useContext(AuthContext);

  const [orders, setOrders] = useState<any[]>([]);
  const [deliveryPersons, setDeliveryPersons] = useState<any[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<{ [key: number]: string }>({});

  // Fetch seller's orders that are ready for delivery
  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/seller/orders/ready-for-delivery", {
        credentials: "include",
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  // Fetch all delivery persons
  const fetchDeliveryPersons = async () => {
    try {
      const res = await fetch("http://localhost:5000/deliveryPersons", {
        credentials: "include",
      });
      const data = await res.json();
      setDeliveryPersons(data);
    } catch (err) {
      console.error("Error fetching delivery persons:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchDeliveryPersons();
  }, []);

  // Assign delivery person to a specific order
  const handleAssign = async (orderId: number) => {
    const deliveryPersonId = selectedDelivery[orderId];
    if (!deliveryPersonId) return;

    setAssigning(true);
    try {
      const res = await fetch(
        `http://localhost:5000/singleOrder/assign-delivery/${orderId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ delivery_person_id: deliveryPersonId }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to assign delivery");

      alert("Delivery person assigned successfully!");
      fetchOrders();
      setSelectedDelivery((prev) => ({ ...prev, [orderId]: "" }));
    } catch (err: any) {
      alert(err.message || "Error assigning delivery");
    } finally {
      setAssigning(false);
    }
  };

  if (authLoading) return <div className="p-6 text-gray-700">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Assign Delivery for Orders</h1>

      {orders.length === 0 ? (
        <p>No orders ready for delivery.</p>
      ) : (
        orders.map((order) => (
          <div key={order.order_id} className="bg-white shadow p-4 rounded mb-4">
            <h2 className="text-xl font-semibold mb-2">Order #{order.order_id}</h2>
            <p>Buyer: {order.buyer_name}</p>
            <p>Total: ETB {order.total_price}</p>
            <p>Status: {order.status}</p>

            <div className="mt-2 flex gap-2">
              <select
                value={selectedDelivery[order.order_id] || ""}
                onChange={(e) =>
                  setSelectedDelivery((prev) => ({ ...prev, [order.order_id]: e.target.value }))
                }
                className="border p-2 rounded flex-1"
              >
                <option value="">Select delivery person</option>
                {deliveryPersons.map((dp) => (
                  <option key={dp.id} value={dp.id}>
                    {dp.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleAssign(order.order_id)}
                disabled={assigning || !selectedDelivery[order.order_id]}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {assigning ? "Assigning..." : "Assign Delivery"}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
