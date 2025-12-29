"use client";

import { ShoppingBag, Wallet, Package, Clock, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

interface Order {
  order_id: number;
  product_id: number;
  seller_id: number;
  quantity: number;
  total_price: string;
  status: string;
  delivery_id: number | null;
  vehicle_type: string | null;
  delivery_name: string | null;
  delivery_phone: string | null;
  delivery_latitude: string | null;
  delivery_longitude: string | null;
}

interface BuyerStatsCardsProps {
  stats?: {
    totalOrders: number;
    totalSpent: number;
    pendingOrders: number;
    completedOrders: number;
    avgOrderValue?: number;
  };
  apiUrl?: string;
  orders?: Order[];
}

export default function BuyerStatsCards({
  stats: propStats,
  apiUrl,
  orders: propOrders,
}: BuyerStatsCardsProps) {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    completedOrders: 0,
    avgOrderValue: 0,
  });
  const [loading, setLoading] = useState(!propStats && !propOrders && !!apiUrl);
  const [error, setError] = useState<string | null>(null);

  // Function to calculate stats from orders
  const calculateStats = (orders: Order[]) => {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce(
      (sum, order) => sum + parseFloat(order.total_price),
      0
    );

    // Pending orders: includes pending, confirmed, processing, assigned_for_delivery
    const pendingOrders = orders.filter(
      (order) =>
        order.status === "pending" ||
        order.status === "confirmed" ||
        order.status === "processing" ||
        order.status === "assigned_for_delivery"
    ).length;

    // Completed orders: delivered or buyer_confirmed
    const completedOrders = orders.filter(
      (order) =>
        order.status === "delivered" || order.status === "buyer_confirmed"
    ).length;

    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    return {
      totalOrders,
      totalSpent,
      pendingOrders,
      completedOrders,
      avgOrderValue,
    };
  };

  // Fetch data or calculate from props
  useEffect(() => {
    // If stats are provided directly, use them
    if (propStats) {
      setStats(propStats);
      setLoading(false);
      return;
    }

    // If orders are provided, calculate stats from them
    if (propOrders) {
      const calculatedStats = calculateStats(propOrders);
      setStats(calculatedStats);
      setLoading(false);
      return;
    }

    // If API URL is provided, fetch data
    if (apiUrl) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const response = await fetch(apiUrl, {
            credentials: "include",
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.message || `HTTP error! status: ${response.status}`
            );
          }

          const data = await response.json();
          const orders: Order[] = data.orders || [];

          const calculatedStats = calculateStats(orders);
          setStats(calculatedStats);
          setError(null);
        } catch (err) {
          console.error("Error fetching stats:", err);
          setError(
            err instanceof Error
              ? err.message
              : "Failed to fetch order statistics"
          );
          // Set default values on error
          setStats({
            totalOrders: 0,
            totalSpent: 0,
            pendingOrders: 0,
            completedOrders: 0,
            avgOrderValue: 0,
          });
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [apiUrl, propStats, propOrders]);

  const cards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: <ShoppingBag className="w-5 h-5" />,
      bgColor: "bg-[#3399FF]",
      textColor: "text-[#3399FF]",
      description: "All purchases",
    },
    {
      title: "Total Spent",
      value: `ETB ${stats.totalSpent.toLocaleString()}`,
      icon: <Wallet className="w-5 h-5" />,
      bgColor: "bg-[#EF837B]",
      textColor: "text-[#EF837B]",
      description: "Lifetime spending",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: <Clock className="w-5 h-5" />,
      bgColor: "bg-gray-800",
      textColor: "text-gray-800",
      description: "Awaiting delivery",
    },
    {
      title: "Completed",
      value: stats.completedOrders,
      icon: <Package className="w-5 h-5" />,
      bgColor: "bg-gray-700",
      textColor: "text-gray-700",
      description: "Delivered orders",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-gray-300 rounded-lg p-5 animate-pulse"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-gray-200 w-10 h-10"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="space-y-2">
              <div className="h-7 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-300 rounded-lg p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-red-100">
            <TrendingUp className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Error Loading Stats</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white border border-gray-300 rounded-lg p-5 hover:border-gray-900 transition-colors group"
        >
          {/* Icon with colored background */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2.5 rounded-lg ${card.bgColor} text-white`}>
              {card.icon}
            </div>
            <div className="text-xs font-medium text-gray-600">
              {card.description}
            </div>
          </div>

          {/* Main content */}
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
            <p className="font-medium text-gray-700">{card.title}</p>
          </div>

          {/* Average value for spending card */}
          {stats.avgOrderValue && stats.avgOrderValue > 0 && index === 1 && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>
                  Avg: ETB{" "}
                  {stats.avgOrderValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </p>
            </div>
          )}

          {/* Colored hover indicator */}
          <div
            className={`mt-4 h-0.5 w-0 ${card.bgColor} group-hover:w-full transition-all duration-300`}
          ></div>
        </div>
      ))}
    </div>
  );
}
