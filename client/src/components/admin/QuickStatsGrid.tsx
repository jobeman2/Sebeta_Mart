"use client";

import { Users, AlertCircle, Activity } from "lucide-react";

interface QuickStatsGridProps {
  stats: {
    totalSellers: number;
    pendingApprovals: number;
    totalBuyers: number;
    cityClerks: number;
    pendingVerifications: number;
    activeListings: number;
    activeTransactions: number;
    recentActivities: number;
  };
}

export function QuickStatsGrid({ stats }: QuickStatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* User Distribution */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">User Distribution</h3>
          <Users className="w-5 h-5 text-gray-500" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Sellers</span>
            <span className="font-medium">{stats.totalSellers}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Buyers</span>
            <span className="font-medium">{stats.totalBuyers}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">City Clerks</span>
            <span className="font-medium">{stats.cityClerks}</span>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Users</span>
              <span className="font-bold text-gray-900">
                {stats.totalSellers + stats.totalBuyers + stats.cityClerks}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Items */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Pending Items</h3>
          <AlertCircle className="w-5 h-5 text-[#EF837B]" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Approvals</span>
            <span className="font-medium">{stats.pendingApprovals}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Verifications</span>
            <span className="font-medium">{stats.pendingVerifications}</span>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Pending</span>
              <span className="font-bold text-[#EF837B]">
                {stats.pendingApprovals + stats.pendingVerifications}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Activity */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Platform Activity</h3>
          <Activity className="w-5 h-5 text-gray-500" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Active Listings</span>
            <span className="font-medium">{stats.activeListings}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Active Transactions</span>
            <span className="font-medium">{stats.activeTransactions}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Recent Activities</span>
            <span className="font-medium">{stats.recentActivities}</span>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Activity</span>
              <span className="font-bold text-gray-900">
                {stats.activeListings +
                  stats.activeTransactions +
                  stats.recentActivities}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
