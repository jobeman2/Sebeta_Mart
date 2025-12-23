import { ShoppingBag, Wallet, Package, Clock, TrendingUp } from "lucide-react";

interface BuyerStatsCardsProps {
  stats: {
    totalOrders: number;
    totalSpent: number;
    pendingOrders: number;
    completedOrders: number;
    avgOrderValue?: number;
  };
}

export default function BuyerStatsCards({ stats }: BuyerStatsCardsProps) {
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
          {stats.avgOrderValue && index === 1 && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Avg: ETB {stats.avgOrderValue.toLocaleString()}</span>
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
