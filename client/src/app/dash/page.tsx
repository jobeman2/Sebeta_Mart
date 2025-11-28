"use client";

import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/Authcontext";

export default function DashboardPage() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  const [seller, setSeller] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [user, loading, router]);

  // Fetch seller info and orders for logged-in user
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // 1️⃣ Fetch seller info
        const sellerRes = await fetch(`http://localhost:5000/sellers/${user.id}`, {
          credentials: "include",
        });
        if (!sellerRes.ok) throw new Error("Failed to fetch seller info");
        const sellerData = await sellerRes.json();
        setSeller(sellerData);

        // 2️⃣ Fetch orders for this seller
        const ordersRes = await fetch("http://localhost:5000/sellerOrders", {
          credentials: "include",
        });
        if (!ordersRes.ok) throw new Error("Failed to fetch seller orders");
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading || loadingData || !seller) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Loading dashboard...
      </div>
    );
  }

  // Metrics
  const totalOrders = orders.length;
  const activeDeliveries = orders.filter((o) => o.status !== "Delivered").length;
  const totalRevenue = orders
    .reduce((sum, o) => sum + Number(o.total_price || 0), 0)
    .toFixed(2);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold">{seller.shop_name || "Your Shop"}</h2>
        <p>Seller ID: {seller.id}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white shadow rounded">
          <p className="font-semibold">Total Orders</p>
          <p>{totalOrders}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <p className="font-semibold">Active Deliveries</p>
          <p>{activeDeliveries}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <p className="font-semibold">Total Revenue</p>
          <p>ETB {totalRevenue}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded p-4">
        <h3 className="font-semibold mb-2">Orders</h3>
        {orders.length > 0 ? (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order.order_id} className="border-b py-4 flex gap-4">
            
                {order.product_image && (
                  <img
                    src={order.product_image}
                    alt={order.product_name}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}

                <div className="flex-1">
                  <p className="font-semibold">Order ID: {order.order_id}</p>
                  <p>Product: {order.product_name}</p>
                  <p>Quantity: {order.quantity}</p>
                  <p>Total: ETB {order.total_price}</p>
                  <p>Status: {order.status || "Pending"}</p>

                  {/* Buyer info */}
                  <div className="mt-1 text-sm text-gray-600">
                    <p>Buyer: {order.buyer_name}</p>
                    <p>Location: {order.buyer_location}</p>
                  </div>

                  {/* Optional: View order details button */}
                  <button
                    className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => router.push(`/orders/${order.order_id}`)}
                  >
                    View Order
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No orders yet.</p>
        )}
      </div>
    </div>
  );
}
