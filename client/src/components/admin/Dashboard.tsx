"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/Authcontext";
import { Users, FileText, BarChart3, Settings, FileCheck, Briefcase, AlertTriangle, MapPin, Home, Banknote, ClipboardCheck } from "lucide-react";

import Header from "./Header";
import StatsGrid from "./StatsGrid";
import QuickActions from "./QuickActions";
import UserCard from "./UserCard";
import RoleTools from "./RoleTools";

type UserRole = "admin" | "city-clerk" | "seller" | "buyer";

interface DashboardStats {
  totalSellers: number;
  pendingApprovals: number;
  totalBuyers: number;
  activeTransactions: number;
  cityClerks: number;
  pendingVerifications: number;
  activeListings: number;
}

interface QuickAction {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  action: () => void;
  roles: UserRole[];
}

export default function Dashboard() {
  const { user, loading, logout } = useContext(AuthContext);
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats>({
    totalSellers: 0,
    pendingApprovals: 0,
    totalBuyers: 0,
    activeTransactions: 0,
    cityClerks: 0,
    pendingVerifications: 0,
    activeListings: 0,
  });

  // Fetch dashboard stats from backend
  useEffect(() => {
    if (!loading && user) {
      const fetchDashboard = async () => {
        try {
          const res = await fetch("http://localhost:5000/admin/dashboard", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          if (!res.ok) throw new Error("Failed to fetch dashboard");
          const data = await res.json();
          setStats(data.dashboard);
        } catch (err) {
          console.error(err);
        }
      };
      fetchDashboard();
    }
  }, [loading, user]);

  // Redirect unauthorized users
  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/admin/login");
      else if (!["admin", "city-clerk"].includes(user.role)) {
        router.replace(user.role === "seller" ? "/seller/dashboard" : "/buyer/dashboard");
      }
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login");
  };

  // Quick actions
  const getQuickActions = (): QuickAction[] => {
    const role = user?.role as UserRole;

    const baseActions: QuickAction[] = [
      { icon: <FileCheck className="w-6 h-6" />, title: "Verify Documents", description: "Review pending verifications", color: "bg-emerald-50 text-emerald-600 border-emerald-200", action: () => router.push("/dashboard/verifications"), roles: ["admin", "city-clerk"] },
      { icon: <BarChart3 className="w-6 h-6" />, title: "View Reports", description: "System analytics & insights", color: "bg-blue-50 text-blue-600 border-blue-200", action: () => router.push("/dashboard/reports"), roles: ["admin", "city-clerk"] },
      { icon: <FileText className="w-6 h-6" />, title: "Documentation", description: "Guidelines & procedures", color: "bg-purple-50 text-purple-600 border-purple-200", action: () => router.push("/dashboard/docs"), roles: ["admin", "city-clerk"] },
    ];

    const adminActions: QuickAction[] = [
      { icon: <Briefcase className="w-6 h-6" />, title: "Approve Sellers", description: `${stats.pendingApprovals} pending requests`, color: "bg-amber-50 text-amber-600 border-amber-200", action: () => router.push("/admin/sellers/pending"), roles: ["admin"] },
      { icon: <Users className="w-6 h-6" />, title: "Manage Users", description: "All user accounts", color: "bg-indigo-50 text-indigo-600 border-indigo-200", action: () => router.push("/admin/users"), roles: ["admin"] },
      { icon: <Users className="w-6 h-6" />, title: "City Clerks", description: "Manage clerk accounts", color: "bg-cyan-50 text-cyan-600 border-cyan-200", action: () => router.push("/admin/clerk"), roles: ["admin"] },
      { icon: <Settings className="w-6 h-6" />, title: "System Settings", description: "Configure platform", color: "bg-gray-50 text-gray-600 border-gray-200", action: () => router.push("/admin/settings"), roles: ["admin"] },
    ];

    const clerkActions: QuickAction[] = [
      { icon: <MapPin className="w-6 h-6" />, title: "Property Records", description: "Manage property data", color: "bg-green-50 text-green-600 border-green-200", action: () => router.push("/clerk/properties"), roles: ["city-clerk"] },
      { icon: <Home className="w-6 h-6" />, title: "Land Records", description: "Land ownership & titles", color: "bg-orange-50 text-orange-600 border-orange-200", action: () => router.push("/clerk/land-records"), roles: ["city-clerk"] },
      { icon: <Banknote className="w-6 h-6" />, title: "Tax Records", description: "Property tax information", color: "bg-red-50 text-red-600 border-red-200", action: () => router.push("/clerk/tax-records"), roles: ["city-clerk"] },
      { icon: <ClipboardCheck className="w-6 h-6" />, title: "Approval Queue", description: "Pending approvals", color: "bg-violet-50 text-violet-600 border-violet-200", action: () => router.push("/clerk/approvals"), roles: ["city-clerk"] },
    ];

    let actions = [...baseActions];
    if (role === "admin") actions = [...actions, ...adminActions];
    else if (role === "city-clerk") actions = [...actions, ...clerkActions];

    return actions.filter(a => a.roles.includes(role));
  };

  // Stats cards
  const getStatsCards = () => {
    const role = user?.role as UserRole;
    const roleDisplayName = role === "admin" ? "Administrator" : "City Clerk";
    const roleColor = role === "admin" ? "from-blue-600 to-indigo-700" : "from-emerald-600 to-teal-700";

    const baseCards = [
      { title: "Pending Verifications", value: stats.pendingVerifications, icon: <FileCheck className="w-6 h-6" />, color: "bg-amber-50 text-amber-600", trend: "+5 today", trendColor: "text-amber-600", roles: ["admin", "city-clerk"] },
      { title: "Active Transactions", value: stats.activeTransactions, icon: <BarChart3 className="w-6 h-6" />, color: "bg-blue-50 text-blue-600", trend: "Real-time", trendColor: "text-blue-600", roles: ["admin", "city-clerk"] },
    ];

    const adminCards = [
      { title: "Total Sellers", value: stats.totalSellers, icon: <Briefcase className="w-6 h-6" />, color: "bg-emerald-50 text-emerald-600", trend: "+12% this month", trendColor: "text-emerald-600", roles: ["admin"] },
      { title: "Pending Approvals", value: stats.pendingApprovals, icon: <AlertTriangle className="w-6 h-6" />, color: "bg-red-50 text-red-600", trend: "Requires attention", trendColor: "text-red-600", roles: ["admin"] },
      { title: "City Clerks", value: stats.cityClerks, icon: <Users className="w-6 h-6" />, color: "bg-purple-50 text-purple-600", trend: "All active", trendColor: "text-purple-600", roles: ["admin"] },
    ];

    const clerkCards = [
      { title: "Active Listings", value: stats.activeListings, icon: <MapPin className="w-6 h-6" />, color: "bg-cyan-50 text-cyan-600", trend: "For sale/lease", trendColor: "text-cyan-600", roles: ["city-clerk"] },
      { title: "Total Buyers", value: stats.totalBuyers, icon: <Users className="w-6 h-6" />, color: "bg-orange-50 text-orange-600", trend: "Registered users", trendColor: "text-orange-600", roles: ["city-clerk"] },
    ];

    let cards = [...baseCards];
    if (role === "admin") cards = [...cards, ...adminCards];
    else if (role === "city-clerk") cards = [...cards, ...clerkCards];

    return { cards, roleDisplayName, roleColor };
  };

  if (loading || !user) return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600 font-medium">Loading dashboard...</p>
    </div>
  );

  const userRole = user.role as UserRole;
  const { cards, roleDisplayName, roleColor } = getStatsCards();
  const quickActions = getQuickActions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header userRole={userRole} roleDisplayName={roleDisplayName} userFullName={user.full_name} roleColor={roleColor} onLogout={handleLogout} />

      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <StatsGrid cards={cards} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <QuickActions actions={quickActions} />
          <div className="space-y-8">
            <UserCard userFullName={user.full_name} userInitial={user.full_name.charAt(0)} roleDisplayName={roleDisplayName} userRole={userRole} roleColor={roleColor} stats={{ totalSellers: stats.totalSellers, totalBuyers: stats.totalBuyers, cityClerks: stats.cityClerks, activeTransactions: stats.activeTransactions }} />
            <RoleTools userRole={userRole} />
          </div>
        </div>
      </main>
    </div>
  );
}
