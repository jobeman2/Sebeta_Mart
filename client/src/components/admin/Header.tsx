"use client";

import { LogOut, Bell, Search, ShieldCheck, Building } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  userRole: "admin" | "city-clerk";
  roleDisplayName: string;
  userFullName: string;
  roleColor: string;
  onLogout: () => void;
}

export default function Header({ 
  userRole, 
  roleDisplayName, 
  userFullName, 
  roleColor, 
  onLogout 
}: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="px-6 py-4 mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${roleColor}`}>
              {userRole === "admin" ? (
                <ShieldCheck className="w-6 h-6 text-white" />
              ) : (
                <Building className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {roleDisplayName} Portal
              </h1>
              <p className="text-sm text-gray-500">Welcome back, {userFullName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="relative">
              <input
                type="search"
                placeholder="Search users, properties..."
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>

            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${roleColor} flex items-center justify-center text-white font-semibold`}>
                {userFullName.charAt(0)}
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}