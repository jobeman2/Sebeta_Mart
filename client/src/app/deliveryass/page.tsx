"use client";
import { useEffect, useState, useCallback } from "react";
import {
  MapPin,
  Phone,
  Package,
  DollarSign,
  User,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface Order {
  order_id: number;
  user_id: number;
  product_id: number;
  seller_id: number;
  quantity: number;
  total_price: number;
  status: string;
  delivery_id: number | null;
  customer_name: string;
  customer_phone: string;
  latitude: string;
  longitude: string;
  product_name?: string;
  seller_name?: string;
  address?: string;
}

interface ApiResponse {
  orders: Order[];
  message?: string;
  count?: number;
}

export default function DeliveryAssignments() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    accepted: 0,
    pending: 0,
  });

  // Calculate statistics
  const calculateStats = useCallback((ordersList: Order[]) => {
    const total = ordersList.length;
    const accepted = ordersList.filter(
      (order) => order.delivery_id !== null
    ).length;
    const pending = total - accepted;

    setStats({ total, accepted, pending });
  }, []);

  // Fetch unassigned orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("http://localhost:5000/delivery/assignments", {
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      const data: ApiResponse = await res.json();

      if (!res.ok) {
        setError(data.message || "Error fetching orders");
        setOrders([]);
        calculateStats([]);
      } else {
        setOrders(data.orders || []);
        calculateStats(data.orders || []);
        if (data.orders?.length === 0) {
          setSuccess("All orders have been assigned!");
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Unable to connect to server. Please check your connection.");
      setOrders([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  // Assign an order to logged-in delivery person
  const assignOrder = async (orderId: number) => {
    setAssigningId(orderId);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:5000/delivery/assign", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ order_id: orderId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to assign order");
      }

      setSuccess(`Order #${orderId} assigned successfully!`);

      // Update local state immediately for better UX
      setOrders((prevOrders) => {
        const updatedOrders = prevOrders.filter(
          (order) => order.order_id !== orderId
        );
        calculateStats(updatedOrders);
        return updatedOrders;
      });

      // Optional: Refetch to ensure sync with server
      setTimeout(() => fetchOrders(), 100);
    } catch (err: any) {
      setError(err.message || "Server error assigning order");
      console.error("Assign error:", err);
    } finally {
      setAssigningId(null);
    }
  };

  // Open location in maps
  const openLocation = (lat: string, lng: string) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, "_blank");
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Refresh orders manually
  const handleRefresh = () => {
    fetchOrders();
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      if (!loading && !assigningId) {
        fetchOrders();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchOrders, loading, assigningId]);

  // Render loading skeleton
  if (loading && orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Delivery Assignments
          </h1>
          <p className="text-gray-600 mt-1">
            Accept and manage delivery orders
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        >
          <svg
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.total}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Assignment</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">
                {stats.pending}
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats.accepted}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
          <div className="flex items-center">
            <CheckCircle2 className="w-5 h-5 text-green-400 mr-3" />
            <div>
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No orders available
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {success
              ? success
              : "All orders have been assigned. Check back later for new delivery opportunities."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Order Details
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Items & Total
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr
                    key={order.order_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        Order #{order.order_id}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {order.product_id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.customer_name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {order.customer_phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.quantity}{" "}
                        {order.quantity === 1 ? "item" : "items"}
                      </div>
                      <div className="text-sm font-bold text-green-600 flex items-center gap-1">
                        ETB {order.total_price}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          openLocation(order.latitude, order.longitude)
                        }
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                      >
                        <MapPin className="w-4 h-4" />
                        View Location
                      </button>
                      <div className="text-xs text-gray-500 mt-1">
                        {order.latitude?.slice(0, 8)},{" "}
                        {order.longitude?.slice(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => assignOrder(order.order_id)}
                        disabled={assigningId === order.order_id}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          assigningId === order.order_id
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow"
                        }`}
                      >
                        {assigningId === order.order_id ? (
                          <span className="flex items-center gap-2">
                            <svg
                              className="animate-spin h-4 w-4 text-current"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Accepting...
                          </span>
                        ) : (
                          "Accept Order"
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="text-center text-sm text-gray-500 pt-4">
        <p>
          Orders auto-refresh every 30 seconds. Click "Accept Order" to claim
          delivery.
        </p>
      </div>
    </div>
  );
}
