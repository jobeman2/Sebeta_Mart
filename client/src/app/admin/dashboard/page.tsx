"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  ShoppingCart,
  FileText,
  Shield,
  Activity,
  AlertCircle,
  Home,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  LayoutDashboard,
  User,
  ShoppingBag,
  Settings,
  Menu,
  X
} from "lucide-react";
import BuyersList from "@/components/admin/buyers";
import SellerList from "@/components/admin/sellerslist";

interface DashboardStats {
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
  };
  dashboard: DashboardStats;
}

interface QuickAction {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  roles: string[];
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  roles: string[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("http://localhost:5000/admin/dashboard", {
        credentials: "include",
      });

      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

      const json: DashboardResponse = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super_admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'city_clerk': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super_admin': return <Shield className="w-5 h-5" />;
      case 'admin': return <Users className="w-5 h-5" />;
      case 'city_clerk': return <UserCheck className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  // Navigation items - FIXED: City clerks can access sellers and buyers
  const navItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      component: <DashboardView data={data} user={data?.user} setCurrentView={setCurrentView} />,
      roles: ["super_admin", "admin", "city_clerk"]
    },
    {
      id: "sellers",
      label: "Sellers",
      icon: <User className="w-5 h-5" />,
      component: <SellerList />,
      roles: ["super_admin", "admin", "city_clerk"] // FIXED: Added city_clerk
    },
    {
      id: "buyers",
      label: "Buyers",
      icon: <Users className="w-5 h-5" />,
      component: <BuyersList />,
      roles: ["super_admin", "admin", "city_clerk"] // FIXED: Added city_clerk
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: <ShoppingCart className="w-5 h-5" />,
      component: <TransactionsView />,
      roles: ["super_admin", "admin"]
    },
    {
      id: "verifications",
      label: "Verifications",
      icon: <FileText className="w-5 h-5" />,
      component: <VerificationsView />,
      roles: ["super_admin", "admin", "city_clerk"]
    },
    {
      id: "listings",
      label: "Listings",
      icon: <Home className="w-5 h-5" />,
      component: <ListingsView />,
      roles: ["super_admin", "admin"]
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-5 h-5" />,
      component: <SettingsView />,
      roles: ["super_admin"]
    }
  ];

  const filteredNavItems = navItems.filter(item => 
    data?.user.role ? item.roles.includes(data.user.role) : true
  );

  const currentNavItem = filteredNavItems.find(item => item.id === currentView) || filteredNavItems[0];

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No dashboard data available</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-white rounded-lg shadow-md"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-40
          transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          transition-transform duration-200 ease-in-out
        `}>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">Admin Panel</h1>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getRoleBadgeColor(data.user.role)}`}>
                  {getRoleIcon(data.user.role)}
                  <span className="capitalize">{data.user.role.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          </div>

          <nav className="p-4">
            <ul className="space-y-1">
              {filteredNavItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setCurrentView(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                      ${currentView === item.id 
                        ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className={`${currentView === item.id ? 'text-blue-600' : 'text-gray-500'}`}>
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">User #{data.user.id}</p>
                <p className="text-xs text-gray-500 capitalize">{data.user.role.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 lg:mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {currentNavItem.label}
                  </h1>
                  {currentView === "dashboard" && (
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {currentView === "dashboard" && (
                  <button
                    onClick={fetchDashboard}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span className="text-sm">Refresh</span>
                  </button>
                )}
              </div>
            </div>

            {/* Current View Content */}
            <div className="mt-4">
              {currentNavItem.component}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Dashboard View Component
function DashboardView({ 
  data, 
  user, 
  setCurrentView 
}: { 
  data: DashboardResponse | null, 
  user: any,
  setCurrentView: (view: string) => void
}) {
  // Fix hydration: Don't use new Date() in initial render
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Set dates only on client side
    setCurrentDate(new Date().toLocaleDateString());
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  if (!data) return null;
  
  const stats = data.dashboard;

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color = "text-gray-800",
    bgColor = "bg-gray-50",
    borderColor = "border-gray-200",
    trend = 0
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color?: string;
    bgColor?: string;
    borderColor?: string;
    trend?: number;
  }) => (
    <div className={`p-6 rounded-lg border ${borderColor} ${bgColor} hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {trend !== 0 && (
            <div className="flex items-center mt-2">
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(trend)}% this week
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${bgColor.replace('bg-', 'bg-').replace('-50', '-100')}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const roleStats = {
    super_admin: [
      { title: "Total Sellers", value: stats.totalSellers, icon: <Users className="w-6 h-6 text-blue-600" />, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200", trend: 12 },
      { title: "City Clerks", value: stats.cityClerks, icon: <Shield className="w-6 h-6 text-purple-600" />, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200", trend: 0 },
      { title: "Pending Approvals", value: stats.pendingApprovals, icon: <AlertCircle className="w-6 h-6 text-yellow-600" />, color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-200", trend: -5 },
      { title: "Active Transactions", value: stats.activeTransactions, icon: <DollarSign className="w-6 h-6 text-green-600" />, color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200", trend: 15 },
    ],
    admin: [
      { title: "Active Listings", value: stats.activeListings, icon: <Home className="w-6 h-6 text-emerald-600" />, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", trend: 8 },
      { title: "Active Transactions", value: stats.activeTransactions, icon: <DollarSign className="w-6 h-6 text-green-600" />, color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200", trend: 15 },
      { title: "Pending Verifications", value: stats.pendingVerifications, icon: <FileText className="w-6 h-6 text-red-600" />, color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200", trend: -3 },
      { title: "Total Buyers", value: stats.totalBuyers, icon: <Users className="w-6 h-6 text-blue-600" />, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200", trend: 10 },
    ],
    city_clerk: [
      { title: "Pending Verifications", value: stats.pendingVerifications, icon: <FileText className="w-6 h-6 text-red-600" />, color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200", trend: -3 },
      { title: "Pending Approvals", value: stats.pendingApprovals, icon: <AlertCircle className="w-6 h-6 text-yellow-600" />, color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-200", trend: -5 },
      { title: "Recent Activities", value: stats.recentActivities, icon: <Activity className="w-6 h-6 text-indigo-600" />, color: "text-indigo-600", bgColor: "bg-indigo-50", borderColor: "border-indigo-200", trend: 20 },
      { title: "Active Listings", value: stats.activeListings, icon: <Home className="w-6 h-6 text-emerald-600" />, color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", trend: 8 },
    ]
  };

  const currentRoleStats = roleStats[user.role as keyof typeof roleStats] || roleStats.admin;

  const quickActions: QuickAction[] = [
    {
      id: 1,
      title: "Manage Sellers",
      description: "View and manage all sellers",
      icon: <User className="w-5 h-5" />,
      action: "sellers",
      roles: ["super_admin", "admin", "city_clerk"] // FIXED: Added city_clerk
    },
    {
      id: 2,
      title: "Manage Buyers",
      description: "View and manage all buyers",
      icon: <Users className="w-5 h-5" />,
      action: "buyers",
      roles: ["super_admin", "admin", "city_clerk"] // FIXED: Added city_clerk
    },
    {
      id: 3,
      title: "View Transactions",
      description: "Monitor active transactions",
      icon: <DollarSign className="w-5 h-5" />,
      action: "transactions",
      roles: ["super_admin", "admin"]
    },
    {
      id: 4,
      title: "Verify Documents",
      description: "Review pending document verifications",
      icon: <FileText className="w-5 h-5" />,
      action: "verifications",
      roles: ["super_admin", "admin", "city_clerk"]
    }
  ];

  const filteredActions = quickActions.filter(action => 
    action.roles.includes(user.role)
  );

  const handleQuickAction = (actionId: string) => {
    setCurrentView(actionId);
  };

  return (
    <>
      {/* Role-based Statistics Grid */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Key Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentRoleStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* All Statistics Grid */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">All Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Sellers" 
            value={stats.totalSellers} 
            icon={<Users className="w-6 h-6 text-blue-600" />}
            color="text-blue-600"
            bgColor="bg-blue-50"
            borderColor="border-blue-200"
            trend={12}
          />
          <StatCard 
            title="Total Buyers" 
            value={stats.totalBuyers} 
            icon={<Users className="w-6 h-6 text-green-600" />}
            color="text-green-600"
            bgColor="bg-green-50"
            borderColor="border-green-200"
            trend={8}
          />
          <StatCard 
            title="Active Listings" 
            value={stats.activeListings} 
            icon={<Home className="w-6 h-6 text-emerald-600" />}
            color="text-emerald-600"
            bgColor="bg-emerald-50"
            borderColor="border-emerald-200"
            trend={10}
          />
          <StatCard 
            title="Active Transactions" 
            value={stats.activeTransactions} 
            icon={<DollarSign className="w-6 h-6 text-purple-600" />}
            color="text-purple-600"
            bgColor="bg-purple-50"
            borderColor="border-purple-200"
            trend={15}
          />
          <StatCard 
            title="Pending Approvals" 
            value={stats.pendingApprovals} 
            icon={<AlertCircle className="w-6 h-6 text-yellow-600" />}
            color="text-yellow-600"
            bgColor="bg-yellow-50"
            borderColor="border-yellow-200"
            trend={-5}
          />
          <StatCard 
            title="Pending Verifications" 
            value={stats.pendingVerifications} 
            icon={<FileText className="w-6 h-6 text-red-600" />}
            color="text-red-600"
            bgColor="bg-red-50"
            borderColor="border-red-200"
            trend={-3}
          />
          <StatCard 
            title="City Clerks" 
            value={stats.cityClerks} 
            icon={<Shield className="w-6 h-6 text-indigo-600" />}
            color="text-indigo-600"
            bgColor="bg-indigo-50"
            borderColor="border-indigo-200"
            trend={0}
          />
          <StatCard 
            title="Recent Activities" 
            value={stats.recentActivities} 
            icon={<Activity className="w-6 h-6 text-pink-600" />}
            color="text-pink-600"
            bgColor="bg-pink-50"
            borderColor="border-pink-200"
            trend={20}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action.action)}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all text-left"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <div className="text-blue-600">{action.icon}</div>
                </div>
                <h3 className="font-semibold text-gray-900">{action.title}</h3>
              </div>
              <p className="text-sm text-gray-600">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Summary Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">System Overview</h3>
            <p className="text-sm text-gray-600">
              Total Users: {stats.totalSellers + stats.totalBuyers + stats.cityClerks} • 
              Pending Items: {stats.pendingApprovals + stats.pendingVerifications} • 
              Active Items: {stats.activeListings + stats.activeTransactions}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{currentDate || "Loading..."}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Placeholder components for other views
function TransactionsView() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Transactions</h2>
        <DollarSign className="w-6 h-6 text-green-600" />
      </div>
      <p className="text-gray-600">Transaction management view coming soon...</p>
    </div>
  );
}

function VerificationsView() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Document Verifications</h2>
        <FileText className="w-6 h-6 text-blue-600" />
      </div>
      <p className="text-gray-600">Document verification view coming soon...</p>
    </div>
  );
}

function ListingsView() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Property Listings</h2>
        <Home className="w-6 h-6 text-emerald-600" />
      </div>
      <p className="text-gray-600">Property listings view coming soon...</p>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">System Settings</h2>
        <Settings className="w-6 h-6 text-purple-600" />
      </div>
      <p className="text-gray-600">Settings view coming soon...</p>
    </div>
  );
}