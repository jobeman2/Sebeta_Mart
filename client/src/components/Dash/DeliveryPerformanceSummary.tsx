import {
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Star,
  Navigation,
  Target,
  Award,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

interface PerformanceMetric {
  label: string;
  value: string | number;
  change: number;
  isPositive: boolean;
}

interface DeliveryPerformanceSummaryProps {
  stats?: {
    onTimeRate: number;
    averageRating: number;
    totalEarnings: number;
    completedToday: number;
  };
}

export default function DeliveryPerformanceSummary({
  stats,
}: DeliveryPerformanceSummaryProps) {
  const [showInsights, setShowInsights] = useState(true);
  const [showWeeklyChart, setShowWeeklyChart] = useState(false);

  // Calculate daily earnings (assuming monthly earnings in stats)
  const dailyEarnings = stats?.totalEarnings
    ? Math.round(stats.totalEarnings / 30)
    : 420;

  const metrics = [
    {
      label: "On-Time Rate",
      value: `${stats?.onTimeRate || 92}%`,
      change: 2,
      isPositive: true,
      icon: <Clock className="w-5 h-5" />,
      bgColor: "bg-[#3399FF]",
    },
    {
      label: "Rating",
      value: stats?.averageRating?.toFixed(1) || "4.7",
      change: 0.2,
      isPositive: true,
      icon: <Star className="w-5 h-5" />,
      bgColor: "bg-gray-800",
    },
    {
      label: "Daily Avg",
      value: `ETB ${dailyEarnings.toLocaleString()}`,
      change: 15,
      isPositive: true,
      icon: <DollarSign className="w-5 h-5" />,
      bgColor: "bg-[#EF837B]",
    },
    {
      label: "Today",
      value: stats?.completedToday || 8,
      change: 25,
      isPositive: true,
      icon: <Target className="w-5 h-5" />,
      bgColor: "bg-gray-700",
    },
  ];

  const insights = [
    {
      title: "Delivery Speed",
      description:
        "Your average delivery time is 15% faster than other drivers in your area.",
      icon: <Navigation className="w-5 h-5" />,
      bgColor: "bg-gray-50",
    },
    {
      title: "Customer Satisfaction",
      description:
        "98% of customers rated you 5 stars for communication and service.",
      icon: <Star className="w-5 h-5" />,
      bgColor: "bg-gray-50",
    },
    {
      title: "Achievements",
      description:
        "You're on track to reach Gold Driver status this month. Keep it up!",
      icon: <Award className="w-5 h-5" />,
      bgColor: "bg-gray-50",
    },
  ];

  const weeklyData = [
    { day: "Mon", deliveries: 8 },
    { day: "Tue", deliveries: 10 },
    { day: "Wed", deliveries: 7 },
    { day: "Thu", deliveries: 12 },
    { day: "Fri", deliveries: 9 },
    { day: "Sat", deliveries: 6 },
    { day: "Sun", deliveries: 5 },
  ];

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-5">
      <div className="mb-6">
        <button
          onClick={() => setShowInsights(!showInsights)}
          className="flex items-center justify-between w-full mb-3 text-gray-900 hover:text-gray-700"
        >
          <h3 className="font-semibold text-gray-900">Performance Insights</h3>
          {showInsights ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {showInsights && (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="border border-gray-300 rounded-lg p-4 hover:border-gray-900 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {insight.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Chart Section - Collapsible */}
      <div>
        <button
          onClick={() => setShowWeeklyChart(!showWeeklyChart)}
          className="flex items-center justify-between w-full mb-3 text-gray-900 hover:text-gray-700"
        >
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">Weekly Performance</h3>
            <span className="text-xs text-gray-500">
              • 70 deliveries this week
            </span>
          </div>
          {showWeeklyChart ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {showWeeklyChart && (
          <>
            {/* Simplified bar chart */}
            <div className="flex items-end justify-between h-32 mb-2">
              {weeklyData.map((day, index) => {
                const heightPercentage = (day.deliveries / 12) * 100;
                const getColor = (deliveries: number) => {
                  if (deliveries >= 10) return "bg-[#3399FF]";
                  if (deliveries >= 7) return "bg-gray-700";
                  return "bg-[#EF837B]";
                };

                return (
                  <div
                    key={day.day}
                    className="flex flex-col items-center flex-1"
                  >
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {day.deliveries}
                    </div>
                    <div className="w-full max-w-12 h-24 flex flex-col justify-end">
                      <div
                        className={`w-full rounded-t ${getColor(
                          day.deliveries
                        )}`}
                        style={{ height: `${heightPercentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">{day.day}</div>
                  </div>
                );
              })}
            </div>

            {/* Week summary */}
            <div className="pt-4 border-t border-gray-300">
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-600">
                  <span className="font-medium">Week goal:</span> 70 deliveries
                  (10/day)
                </div>
                <div className="text-gray-900">
                  <span className="font-medium">Current:</span> 57 deliveries
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
