"use client";

import {
  ShoppingBag,
  DollarSign,
  Truck,
  TrendingUp,
  Package,
} from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalOrders: number;
    activeDeliveries: number;
    totalRevenue: number;
    avgOrderValue: number;
    conversionRate: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: <ShoppingBag className="w-5 h-5" />,
      change: "+12%",
      color: "bg-[#3399FF]",
      bgColor: "bg-[#3399FF]/10",
      textColor: "text-[#3399FF]",
    },
    {
      title: "Total Revenue",
      value: `ETB ${stats.totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="w-5 h-5" />,
      change: "+8%",
      color: "bg-[#EF837B]",
      bgColor: "bg-[#EF837B]/10",
      textColor: "text-[#EF837B]",
    },
    {
      title: "Active Deliveries",
      value: stats.activeDeliveries,
      icon: <Truck className="w-5 h-5" />,
      change: `${stats.activeDeliveries} Active`,
      color: "bg-gray-800",
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
    },
    {
      title: "Conversion Rate",
      value: `${stats.conversionRate}%`,
      icon: <TrendingUp className="w-5 h-5" />,
      change: `ETB ${stats.avgOrderValue.toFixed(0)} avg`,
      color: "bg-emerald-500",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2.5 rounded-lg ${card.bgColor}`}>
              <div className={card.textColor}>{card.icon}</div>
            </div>
            <span
              className={`text-xs font-medium px-2 py-1 rounded ${card.bgColor} ${card.textColor}`}
            >
              {card.change}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-semibold text-gray-900">
              {card.value}
            </h3>
            <p className="text-sm text-gray-500">{card.title}</p>
          </div>

          {/* Progress bar for conversion rate */}
          {index === 3 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Target: 5%</span>
                <span>{stats.conversionRate}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${card.color} rounded-full`}
                  style={{
                    width: `${Math.min(stats.conversionRate * 20, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
