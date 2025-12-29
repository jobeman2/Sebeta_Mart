"use client";

import { CheckCircle, Clock, Users, TrendingUp } from "lucide-react";

interface Order {
  status: string;
}

interface PerformanceSummaryProps {
  orders: Order[];
}

export default function PerformanceSummary({ orders }: PerformanceSummaryProps) {
  const completedOrders = orders.filter(o => o.status?.toLowerCase() === 'delivered' || o.status?.toLowerCase() === 'completed').length;
  const completionRate = orders.length > 0 ? Math.round((completedOrders / orders.length) * 100) : 0;

  const stats = [
    { label: "Completed", value: completedOrders, color: "bg-emerald-500" },
    { label: "Pending", value: orders.filter(o => o.status?.toLowerCase() === 'pending').length, color: "bg-amber-500" },
    { label: "Rate", value: `${completionRate}%`, color: "bg-[#3399FF]" }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Performance</h2>
            <p className="text-sm text-gray-500">Business metrics</p>
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            +15%
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-xl font-semibold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
              <div className="mt-2 mx-auto w-8 h-0.5 rounded-full" style={{ backgroundColor: stat.color }}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="p-5">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-gray-600">Completed Orders</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{completedOrders}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#3399FF]" />
              <span className="text-sm text-gray-600">Avg Processing Time</span>
            </div>
            <span className="text-sm font-medium text-gray-900">1.8 days</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-[#EF837B]" />
              <span className="text-sm text-gray-600">Repeat Customers</span>
            </div>
            <span className="text-sm font-medium text-gray-900">12</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="p-5">
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-900">Order Completion Rate</span>
            <span className="text-gray-600">{completionRate}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}