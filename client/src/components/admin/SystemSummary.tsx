"use client";

interface SystemSummaryProps {
  stats: {
    totalSellers: number;
    pendingApprovals: number;
    totalBuyers: number;
    cityClerks: number;
    pendingVerifications: number;
    activeListings: number;
    activeTransactions: number;
  };
}

export function SystemSummary({ stats }: SystemSummaryProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900">System Summary</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">All systems operational</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {stats.totalSellers + stats.totalBuyers + stats.cityClerks}
          </p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Pending Items</p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {stats.pendingApprovals + stats.pendingVerifications}
          </p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Active Items</p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {stats.activeListings + stats.activeTransactions}
          </p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Last Updated</p>
          <p className="text-sm font-bold text-gray-900 mt-1">
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
