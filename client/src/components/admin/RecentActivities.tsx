"use client";

import { CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";

interface Activity {
  id: number;
  user: string;
  action: string;
  time: string;
  type: "success" | "info" | "warning" | "error";
}

interface RecentActivitiesProps {
  activities: Activity[];
}

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View all
        </button>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center p-4 hover:bg-gray-50 rounded-xl transition-colors">
            <div className={`p-2 rounded-lg mr-4 ${
              activity.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
              activity.type === 'warning' ? 'bg-amber-50 text-amber-600' :
              activity.type === 'error' ? 'bg-red-50 text-red-600' :
              'bg-blue-50 text-blue-600'
            }`}>
              {activity.type === 'success' ? 
                <CheckCircle className="w-4 h-4" /> : 
                activity.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                <AlertCircle className="w-4 h-4" />
              }
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{activity.user}</p>
              <p className="text-sm text-gray-600">{activity.action}</p>
            </div>
            <span className="text-sm text-gray-500">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}