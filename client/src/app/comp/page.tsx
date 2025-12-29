"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  Package,
  Phone,
  User,
  ShoppingCart,
  DollarSign,
  Loader2,
  AlertCircle,
  Truck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

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

export default function AssignedOrdersDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completingOrder, setCompletingOrder] = useState<number | null>(null);
  const [showDelivered, setShowDelivered] = useState(true);

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
    setCompletingOrder(orderId);
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
        fetchOrders(); // Refresh list
      }
    } catch (err) {
      console.error(err);
      alert("Server error updating order");
    } finally {
      setCompletingOrder(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Separate orders into pending and delivered
  const pendingOrders = orders.filter((order) => order.status !== "delivered");
  const deliveredOrders = orders.filter(
    (order) => order.status === "delivered"
  );

  // Stats calculation
  const stats = {
    total: orders.length,
    delivered: deliveredOrders.length,
    pending: pendingOrders.length,
    totalRevenue: orders.reduce(
      (sum, order) => sum + parseFloat(order.total_price),
      0
    ),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading assigned orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 text-red-700">
          <AlertCircle className="h-6 w-6" />
          <div>
            <p className="font-semibold">Error Loading Orders</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600">
          No Assigned Orders
        </h3>
        <p className="text-gray-500 mt-1">
          You don't have any orders assigned at the moment.
        </p>
        <button
          onClick={fetchOrders}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assigned Orders</h1>
          <p className="text-gray-600">
            Manage and track your delivery assignments
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          Refresh Orders
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Delivery</p>
              <p className="text-2xl font-bold mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Truck className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-2xl font-bold mt-1">{stats.delivered}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">
                ${stats.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders (Pending) Section */}
      {pendingOrders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Recent Orders ({pendingOrders.length})
              </h2>
              <p className="text-gray-600 text-sm">
                Orders waiting to be delivered
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {pendingOrders.map((order) => (
              <div
                key={order.order_id}
                className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                <div className="px-6 py-4 bg-blue-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Order #{order.order_id}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-gray-900">
                        ${order.total_price}
                      </span>
                      <button
                        onClick={() => completeOrder(order.order_id)}
                        disabled={completingOrder === order.order_id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {completingOrder === order.order_id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Mark as Delivered
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Customer</p>
                        <p className="font-medium">{order.customer_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Phone className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{order.customer_phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <ShoppingCart className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Quantity</p>
                        <p className="font-medium">{order.quantity} items</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <DollarSign className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Unit Price</p>
                        <p className="font-medium">
                          $
                          {(
                            parseFloat(order.total_price) / order.quantity
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivered Orders Section */}
      {deliveredOrders.length > 0 && (
        <div className="space-y-4">
          <button
            onClick={() => setShowDelivered(!showDelivered)}
            className="flex items-center justify-between w-full p-4 bg-green-50 rounded-xl border border-green-200 hover:bg-green-100 transition"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="text-left">
                <h2 className="text-xl font-bold text-gray-900">
                  Delivered Orders ({deliveredOrders.length})
                </h2>
                <p className="text-gray-600 text-sm">
                  Orders that have been completed
                </p>
              </div>
            </div>
            {showDelivered ? (
              <ChevronUp className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-600" />
            )}
          </button>

          {showDelivered && (
            <div className="space-y-4">
              {deliveredOrders.map((order) => (
                <div
                  key={order.order_id}
                  className="bg-white rounded-xl border border-green-200 shadow-sm overflow-hidden"
                >
                  <div className="px-6 py-4 bg-green-50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Order #{order.order_id}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Delivered
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-gray-900">
                          ${order.total_price}
                        </span>
                        <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg border border-green-200 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Completed
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Customer</p>
                          <p className="font-medium">{order.customer_name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Phone className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium">{order.customer_phone}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <ShoppingCart className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Quantity</p>
                          <p className="font-medium">{order.quantity} items</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <DollarSign className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Unit Price</p>
                          <p className="font-medium">
                            $
                            {(
                              parseFloat(order.total_price) / order.quantity
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold">
              {pendingOrders.length} pending
            </span>{" "}
            and{" "}
            <span className="font-semibold">
              {deliveredOrders.length} delivered
            </span>{" "}
            orders
          </div>
          <div className="text-sm text-gray-600">
            Last updated:{" "}
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
