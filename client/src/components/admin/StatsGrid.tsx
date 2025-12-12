"use client";

interface StatCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend: string;
  trendColor: string;
}

interface StatsGridProps {
  cards: StatCard[];
}

export default function StatsGrid({ cards }: StatsGridProps) {
  const gridCols = cards.length > 3 ? '4' : '3';
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${gridCols} gap-6 mb-8`}>
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
              <p className={`text-sm ${card.trendColor} mt-1 flex items-center`}>
                <span className={`flex w-2 h-2 ${card.trendColor.replace('text-', 'bg-')} rounded-full mr-2`}></span>
                {card.trend}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${card.color}`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}