"use client";

import { Shield, Bell, Search, Menu, X } from "lucide-react";

interface AdminHeaderProps {
  user: {
    id: number;
    role: string;
    name?: string;
    email?: string;
  };
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const getRoleBg = (role: string) => {
  switch (role.toLowerCase()) {
    case "super_admin":
      return "bg-[#3399FF] bg-opacity-10";
    case "admin":
      return "bg-gray-100";
    case "city_clerk":
      return "bg-[#EF837B] bg-opacity-10";
    default:
      return "bg-gray-100";
  }
};

const getRoleColor = (role: string) => {
  switch (role.toLowerCase()) {
    case "super_admin":
      return "text-[#3399FF]";
    case "admin":
      return "text-gray-800";
    case "city_clerk":
      return "text-[#EF837B]";
    default:
      return "text-gray-600";
  }
};

export function AdminHeader({
  user,
  sidebarOpen,
  setSidebarOpen,
  searchQuery,
  setSearchQuery,
}: AdminHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 px-4 lg:px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
        >
          {sidebarOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-black rounded-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Admin Panel</h1>
            <div
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBg(
                user.role
              )} ${getRoleColor(user.role)}`}
            >
              <span className="capitalize">{user.role.replace("_", " ")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center bg-gray-50 rounded-xl px-3 py-2 w-64">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Notifications */}
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF837B] rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-gray-900">
              {user.name || `User #${user.id}`}
            </p>
            <p className="text-xs text-gray-500">
              {user.email || `${user.role.replace("_", " ")}`}
            </p>
          </div>
          <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user.name?.[0] || user.role[0].toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
