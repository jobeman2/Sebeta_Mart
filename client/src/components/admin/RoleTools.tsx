"use client";

import { Settings } from "lucide-react";

interface RoleToolsProps {
  userRole: "admin" | "city-clerk";
}

export default function RoleTools({ userRole }: RoleToolsProps) {
  const adminTools = [
    { name: "User Management", status: "Active", color: "bg-blue-100 text-blue-600" },
    { name: "System Logs", status: "View", color: "bg-green-100 text-green-600" },
    { name: "Audit Trail", status: "Track", color: "bg-purple-100 text-purple-600" },
  ];

  const clerkTools = [
    { name: "Document Scanner", status: "Ready", color: "bg-blue-100 text-blue-600" },
    { name: "Record Search", status: "Active", color: "bg-green-100 text-green-600" },
    { name: "Batch Processing", status: "Available", color: "bg-amber-100 text-amber-600" },
  ];

  const tools = userRole === "admin" ? adminTools : clerkTools;
  const title = userRole === "admin" ? "Administration Tools" : "Clerk Tools";
  const buttonText = userRole === "admin" ? "Admin Settings" : "Clerk Settings";

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <h3 className="font-bold text-gray-900 mb-4">
        {title}
      </h3>
      <div className="space-y-4">
        {tools.map((tool, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">{tool.name}</span>
            <span className={`px-2 py-1 text-xs font-medium ${tool.color} rounded`}>
              {tool.status}
            </span>
          </div>
        ))}
        <button className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors font-medium">
          <Settings className="w-4 h-4" />
          <span>{buttonText}</span>
        </button>
      </div>
    </div>
  );
}