import { ArrowUpRight, TrendingUp, Package } from "lucide-react";

interface QuickActionsProps {
  onAddProduct: () => void;
  onViewAnalytics: () => void;
  onManageInventory: () => void;
}

const PlusCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

export default function QuickActions({ onAddProduct, onViewAnalytics, onManageInventory }: QuickActionsProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <button 
          onClick={onAddProduct}
          className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <PlusCircle className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-medium text-gray-900">Add New Product</span>
          </div>
          <ArrowUpRight className="w-4 h-4 text-gray-400" />
        </button>
        <button 
          onClick={onViewAnalytics}
          className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="font-medium text-gray-900">View Analytics</span>
          </div>
          <ArrowUpRight className="w-4 h-4 text-gray-400" />
        </button>
        <button 
          onClick={onManageInventory}
          className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50">
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="font-medium text-gray-900">Manage Inventory</span>
          </div>
          <ArrowUpRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
}