"use client";

import {
  LayoutDashboard,
  User,
  Users,
  CreditCard,
  ShieldCheck,
  Home,
  BarChart3,
  Settings,
  ChevronRight,
  FileText,
  LogOut,
  Package, // Add this icon for Delivery
} from "lucide-react";

interface AdminSidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  userRole: string;
}

export function AdminSidebar({
  currentView,
  setCurrentView,
  sidebarOpen,
  setSidebarOpen,
  userRole,
}: AdminSidebarProps) {
  // Define all navigation items with roles - ADDED DELIVERY
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      roles: ["super_admin", "admin", "city_clerk"],
    },
    {
      id: "sellers",
      label: "Sellers",
      icon: <User className="w-5 h-5" />,
      roles: ["super_admin", "admin", "city_clerk"],
    },
    {
      id: "buyers",
      label: "Buyers",
      icon: <Users className="w-5 h-5" />,
      roles: ["super_admin", "admin", "city_clerk"],
    },
    {
      id: "delivery", // ADD THIS NEW ITEM
      label: "Delivery",
      icon: <Package className="w-5 h-5" />,
      roles: ["super_admin", "admin", "city_clerk"],
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: <CreditCard className="w-5 h-5" />,
      roles: ["super_admin", "admin", "city_clerk"], // City clerk can view
    },
    {
      id: "verifications",
      label: "Verifications",
      icon: <ShieldCheck className="w-5 h-5" />,
      roles: ["super_admin", "admin", "city_clerk"],
    },
    {
      id: "listings",
      label: "Add Clerck",
      icon: <Home className="w-5 h-5" />,
      roles: ["super_admin", "admin", "city_clerk"], // City clerk can view
    },
    {
      id: "reports",
      label: "Reports",
      icon: <FileText className="w-5 h-5" />,
      roles: ["super_admin", "admin", "city_clerk"],
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart3 className="w-5 h-5" />,
      roles: ["super_admin", "admin", "city_clerk"], // City clerk can view
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-5 h-5" />,
      roles: ["super_admin", "admin", "city_clerk"], // City clerk can view
    },
  ];

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <>
      <aside
        className={`
          fixed lg:static top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 z-30
          transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0
          transition-transform duration-200 ease-in-out overflow-y-auto
        `}
      >
        <nav className="p-6">
          {/* Role Badge */}
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs font-medium text-gray-700 mb-1">
              Logged in as
            </div>
            <div className="text-sm font-semibold text-gray-900 capitalize">
              {userRole.replace("_", " ")}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Navigation
            </h3>
            <ul className="space-y-1">
              {filteredNavItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setCurrentView(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                      ${
                        currentView === item.id
                          ? "bg-black text-white"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={
                          currentView === item.id
                            ? "text-white"
                            : "text-gray-500"
                        }
                      >
                        {item.icon}
                      </div>
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                    {currentView === item.id && (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              System
            </h3>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                <Settings className="w-4 h-4" />
                <span className="font-medium text-sm">Preferences</span>
              </button>
              <button
                onClick={() => {
                  // Handle logout
                  fetch("http://localhost:5000/auth/logout", {
                    credentials: "include",
                  }).then(() => {
                    window.location.href = "/admin/login";
                  });
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium text-sm">Logout</span>
              </button>
            </div>
          </div>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
