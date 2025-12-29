"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Search, ChevronRight, AlertCircle } from "lucide-react";
import { LoadingError } from "@/components/admin/loadinerror";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { RoleBasedMetrics } from "@/components/admin/RoleBasedMetrics";
import { QuickStatsGrid } from "@/components/admin/QuickStatsGrid";
import { SystemSummary } from "@/components/admin/SystemSummary";
import { Buyers } from "@/components/admin/Buyers";
import { SellersList } from "@/components/admin/SellersList";
import { DeliveryList } from "@/components/admin/DeliveryList";
import { TransactionsView } from "@/components/admin/TransactionView";
import { MobileSearch } from "@/components/admin/MobileSearch";
import { ReportsView } from "@/components/admin/ReportsView"; // Import ReportsView
import { ListingsView } from "@/components/admin/ListingsView"; // Import ListingsView

interface DashboardStatsType {
  totalSellers: number;
  pendingApprovals: number;
  totalBuyers: number;
  activeTransactions: number;
  cityClerks: number;
  recentActivities: number;
  pendingVerifications: number;
  activeListings: number;
}

interface DashboardResponse {
  user: {
    id: number;
    role: string;
    name?: string;
    email?: string;
  };
  dashboard: DashboardStatsType;
}

// Keep other placeholder components
const VerificationsView = () => (
  <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Verifications</h2>
    <p className="text-gray-600">Document verification view coming soon...</p>
  </div>
);

const AnalyticsView = () => (
  <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h2>
    <p className="text-gray-600">Analytics view coming soon...</p>
  </div>
);

const SettingsView = () => (
  <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
    <p className="text-gray-600">Settings view coming soon...</p>
  </div>
);

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDashboard = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/dashboard", {
        credentials: "include",
      });

      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const json: DashboardResponse = await res.json();

      // Check if user has admin access (including city_clerk)
      const isAdminType = ["super_admin", "admin", "city_clerk"].includes(
        json.user.role
      );
      if (!isAdminType) {
        throw new Error("Unauthorized access. Admin privileges required.");
      }

      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Handle unauthorized access
  if (error && error.includes("Unauthorized")) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access the admin dashboard. This area
              is restricted to administrators and city clerks only.
            </p>
            <button
              onClick={() => (window.location.href = "/")}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Home Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render current view component
  const renderView = () => {
    if (!data) return null;

    // City clerk view restrictions (view-only for some sections)
    const isCityClerk = data.user.role === "city_clerk";

    switch (currentView) {
      case "dashboard":
        return (
          <div className="space-y-8">
            {isCityClerk && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      City Clerk Access
                    </p>
                    <p className="text-sm text-blue-700">
                      You have view-only access to some sections. Some actions
                      may be restricted.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <RoleBasedMetrics
              userRole={data.user.role}
              stats={data.dashboard}
            />
            <DashboardStats stats={data.dashboard} />
            <QuickStatsGrid stats={data.dashboard} />
            <SystemSummary stats={data.dashboard} />
          </div>
        );
      case "sellers":
        return <SellersList isCityClerk={isCityClerk} />;
      case "buyers":
        return <Buyers isCityClerk={isCityClerk} />;
      case "delivery":
        return <DeliveryList isCityClerk={isCityClerk} />;
      case "transactions":
        return <TransactionsView />;
      case "verifications":
        return <VerificationsView />;
      case "listings":
        return (
          <>
            {isCityClerk && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-yellow-900">
                  View Only Access
                </p>
                <p className="text-sm text-yellow-700">
                  Listings are view-only for city clerks.
                </p>
              </div>
            )}
            <ListingsView />
          </>
        );
      case "reports":
        return (
          <>
            {isCityClerk && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-yellow-900">
                  View Only Access
                </p>
                <p className="text-sm text-yellow-700">
                  Reports are view-only for city clerks.
                </p>
              </div>
            )}
            <ReportsView />
          </>
        );
      case "analytics":
        return (
          <>
            {isCityClerk && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-yellow-900">
                  View Only Access
                </p>
                <p className="text-sm text-yellow-700">
                  Analytics are view-only for city clerks.
                </p>
              </div>
            )}
            <AnalyticsView />
          </>
        );
      case "settings":
        return (
          <>
            {isCityClerk && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-yellow-900">
                  View Only Access
                </p>
                <p className="text-sm text-yellow-700">
                  Some settings may be restricted for city clerks.
                </p>
              </div>
            )}
            <SettingsView />
          </>
        );
      default:
        return null;
    }
  };

  // Get current view label for breadcrumb
  const getCurrentViewLabel = () => {
    const viewLabels: Record<string, string> = {
      dashboard: "Dashboard",
      sellers: "Sellers",
      buyers: "Buyers",
      delivery: "Delivery",
      transactions: "Transactions",
      verifications: "Verifications",
      listings: "Listings",
      reports: "Reports",
      analytics: "Analytics",
      settings: "Settings",
    };
    return viewLabels[currentView] || "Dashboard";
  };

  // Display role in header
  const getUserRoleDisplay = () => {
    if (!data) return "";
    const roleMap: Record<string, string> = {
      super_admin: "Super Admin",
      admin: "Admin",
      city_clerk: "City Clerk",
    };
    return roleMap[data.user.role] || data.user.role;
  };

  return (
    <div className="min-h-screen bg-white">
      <LoadingError loading={loading} error={error} onRetry={fetchDashboard} />

      {data && (
        <>
          <AdminHeader
            user={data.user}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            userRoleDisplay={getUserRoleDisplay()}
          />

          <div className="flex pt-16">
            <AdminSidebar
              currentView={currentView}
              setCurrentView={setCurrentView}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              userRole={data.user.role}
            />

            <main className="flex-1 p-4 lg:p-6">
              <div className="max-w-6xl mx-auto">
                {/* Breadcrumb with role */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="hover:text-gray-700 cursor-pointer">
                      Admin
                    </span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900 font-medium">
                      {getCurrentViewLabel()}
                    </span>
                  </div>
                  <span className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                    {getUserRoleDisplay()}
                  </span>
                </div>

                {/* Page Header */}
                <div className="mb-6 lg:mb-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {getCurrentViewLabel()}
                      </h1>
                      {currentView === "dashboard" && (
                        <p className="text-gray-600 mt-2 text-sm">
                          Welcome back, {data.user.name || getUserRoleDisplay()}
                          ! Here's what's happening with your platform today.
                        </p>
                      )}
                    </div>

                    {currentView === "dashboard" && (
                      <button
                        onClick={fetchDashboard}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span className="font-medium">Refresh Data</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile Search */}
                <MobileSearch
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  placeholder={`Search ${getCurrentViewLabel().toLowerCase()}...`}
                />

                {/* Current View Content */}
                <div className="mt-4">{renderView()}</div>
              </div>
            </main>
          </div>
        </>
      )}
    </div>
  );
}
