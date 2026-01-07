import { AlertCircle, MapPin } from "lucide-react";

interface Order {
  order_id: string;
  buyer_location: string;
}

interface PendingActionsProps {
  orders: Order[];
  onProcessOrder: (orderId: string) => void;
}

export default function PendingActions({
  orders,
  onProcessOrder,
}: PendingActionsProps) {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Action Required
            </h3>
            <p className="text-gray-500 text-sm">
              {orders.length} pending orders need your attention
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
