"use client";

import { ChevronRight } from "lucide-react";

interface QuickAction {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  action: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
        <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
          {actions.length} actions available
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className="group bg-white p-6 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 text-left"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${action.color}`}>
                {action.icon}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
            <p className="text-sm text-gray-500">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}