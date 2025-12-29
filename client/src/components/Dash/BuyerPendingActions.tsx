import { AlertCircle, CheckCircle, Clock, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PendingAction {
  id: number;
  type: 'review' | 'payment' | 'delivery' | 'confirmation';
  title: string;
  description: string;
  orderId?: number;
  productName?: string;
  deadline?: string;
  priority: 'high' | 'medium' | 'low';
}

interface BuyerPendingActionsProps {
  actions: PendingAction[];
}

export default function BuyerPendingActions({ actions }: BuyerPendingActionsProps) {
  const getActionIcon = (type: string) => {
    switch(type) {
      case 'review':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'payment':
        return <ShoppingBag className="w-5 h-5 text-blue-600" />;
      case 'delivery':
        return <Clock className="w-5 h-5 text-green-600" />;
      case 'confirmation':
        return <CheckCircle className="w-5 h-5 text-purple-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionButton = (action: PendingAction) => {
    switch(action.type) {
      case 'review':
        return { text: 'Leave Review', href: `/orders/${action.orderId}/review` };
      case 'payment':
        return { text: 'Complete Payment', href: `/orders/${action.orderId}/payment` };
      case 'delivery':
        return { text: 'Track Delivery', href: `/orders/${action.orderId}/track` };
      case 'confirmation':
        return { text: 'Confirm Receipt', href: `/orders/${action.orderId}/confirm` };
      default:
        return { text: 'View Details', href: `/orders/${action.orderId}` };
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-amber-600" />
          Pending Actions
        </h2>
        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
          {actions.length} actions
        </span>
      </div>

      {actions.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">All caught up!</h3>
          <p className="text-gray-500">No pending actions at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {actions.map((action) => {
            const button = getActionButton(action);
            return (
              <div key={action.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    {getActionIcon(action.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-gray-900">{action.title}</h4>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(action.priority)}`}>
                        {action.priority}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{action.description}</p>
                    {action.productName && (
                      <p className="text-gray-500 text-sm mt-1">
                        Product: <span className="font-medium">{action.productName}</span>
                      </p>
                    )}
                    {action.deadline && (
                      <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Due: {action.deadline}
                      </p>
                    )}
                  </div>
                </div>
                <Link
                  href={button.href}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  {button.text}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}