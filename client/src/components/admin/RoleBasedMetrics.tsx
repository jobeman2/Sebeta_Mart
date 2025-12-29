"use client";

import {
  Users,
  Shield,
  AlertCircle,
  DollarSign,
  Home,
  FileText,
  Activity,
} from "lucide-react";

interface RoleBasedMetricsProps {
  userRole: string;
  stats: {
    totalSellers: number;
    pendingApprovals: number;
    totalBuyers: number;
    activeTransactions: number;
    cityClerks: number;
    recentActivities: number;
    pendingVerifications: number;
    activeListings: number;
  };
}

export function RoleBasedMetrics({ userRole, stats }: RoleBasedMetricsProps) {
  const StatCard = ({
    title,
    value,
    icon,
    trend,
    color = "text-gray-900",
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    trend?: number;
    color?: string;
  }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
          <p className={`text-2xl font-bold ${color} mb-1`}>
            {value.toLocaleString()}
          </p>
          {trend !== undefined && (
            <div className="flex items-center">
              <span
                className={`text-xs font-medium ${
                  trend > 0 ? "text-green-600" : "text-[#EF837B]"
                }`}
              >
                {trend > 0 ? "+" : ""}
                {trend}%
              </span>
            </div>
          )}
        </div>
        <div className="p-2 bg-gray-50 rounded-lg">
          <div className="text-gray-700">{icon}</div>
        </div>
      </div>
    </div>
  );

  const roleMetrics = {
    super_admin: [
      {
        title: "Total Sellers",
        value: stats.totalSellers,
        icon: <Users className="w-6 h-6" />,
        trend: 12,
        color: "text-[#3399FF]",
      },
      {
        title: "City Clerks",
        value: stats.cityClerks,
        icon: <Shield className="w-6 h-6" />,
        trend: 0,
      },
      {
        title: "Pending Approvals",
        value: stats.pendingApprovals,
        icon: <AlertCircle className="w-6 h-6" />,
        trend: -5,
        color: "text-[#EF837B]",
      },
      {
        title: "Active Transactions",
        value: stats.activeTransactions,
        icon: <DollarSign className="w-6 h-6" />,
        trend: 15,
      },
    ],
    admin: [
      {
        title: "Active Listings",
        value: stats.activeListings,
        icon: <Home className="w-6 h-6" />,
        trend: 8,
      },
      {
        title: "Active Transactions",
        value: stats.activeTransactions,
        icon: <DollarSign className="w-6 h-6" />,
        trend: 15,
      },
      {
        title: "Pending Verifications",
        value: stats.pendingVerifications,
        icon: <FileText className="w-6 h-6" />,
        trend: -3,
        color: "text-[#EF837B]",
      },
      {
        title: "Total Buyers",
        value: stats.totalBuyers,
        icon: <Users className="w-6 h-6" />,
        trend: 10,
      },
    ],
    city_clerk: [
      {
        title: "Pending Verifications",
        value: stats.pendingVerifications,
        icon: <FileText className="w-6 h-6" />,
        trend: -3,
        color: "text-[#EF837B]",
      },
      {
        title: "Pending Approvals",
        value: stats.pendingApprovals,
        icon: <AlertCircle className="w-6 h-6" />,
        trend: -5,
        color: "text-[#EF837B]",
      },
      {
        title: "Recent Activities",
        value: stats.recentActivities,
        icon: <Activity className="w-6 h-6" />,
        trend: 20,
      },
      {
        title: "Active Listings",
        value: stats.activeListings,
        icon: <Home className="w-6 h-6" />,
        trend: 8,
      },
    ],
  };

  const metrics =
    roleMetrics[userRole as keyof typeof roleMetrics] || roleMetrics.admin;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Your Key Metrics</h3>
        <span className="text-sm text-gray-500">
          Based on your role as {userRole.replace("_", " ")}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <StatCard key={index} {...metric} />
        ))}
      </div>
    </div>
  );
}
