"use client";

import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Truck, CreditCard, Heart } from "lucide-react";
import { AuthContext } from "@/context/Authcontext";
import Sidebar from "@/components/dashboard/Sidebar";
import HeroSection from "@/components/dashboard/HeroSection";
import MetricCard from "@/components/dashboard/MetricCard";
import DashboardContent from "@/components/dashboard/DashboardContent";
import Card from "@/components/dashboard/Card";
import AddProductForm from "@/components/dashboard/AddProduct";

export default function Dashboard() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "orders"
    | "wishlist"
    | "shop"
    | "account"
    | "notifications"
    | "add product"
  >("overview");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [seller, setSeller] = useState<any>(null);
  const [sellerLoading, setSellerLoading] = useState(true);
  const [sellerOrders, setSellerOrders] = useState<any[]>([]);
  const [sellerOrdersLoading, setSellerOrdersLoading] = useState(true);

  const [notifications] = useState([
    {
      id: "1",
      message: "Your order ORD-1002 is now in transit.",
      date: "Oct 22, 2025",
      read: false,
    },
    {
      id: "2",
      message: "Your wishlist item 'Cheese Combo' is on sale!",
      date: "Oct 21, 2025",
      read: true,
    },
    {
      id: "3",
      message: "Password changed successfully.",
      date: "Oct 20, 2025",
      read: true,
    },
  ]);

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [user, loading, router]);

  // 🏪 Fetch seller info
  useEffect(() => {
    if (!user) return;

    const fetchSeller = async () => {
      try {
        const res = await fetch(`http://localhost:5000/sellers/${user.id}`, {
          credentials: "include",
        });
        if (res.ok) setSeller(await res.json());
        else setSeller(null);
      } catch (err) {
        console.error("Failed to fetch seller info:", err);
        setSeller(null);
      } finally {
        setSellerLoading(false);
      }
    };

    fetchSeller();
  }, [user]);

  // 🛒 Fetch seller orders
  useEffect(() => {
    if (!seller) {
      setSellerOrders([]);
      setSellerOrdersLoading(false);
      return;
    }

    const fetchSellerOrders = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/sellerOrders/${seller.id}`,
          {
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Failed to fetch seller orders");
        const data = await res.json();
        setSellerOrders(data);
      } catch (err) {
        console.error("Failed to fetch seller orders:", err);
        setSellerOrders([]);
      } finally {
        setSellerOrdersLoading(false);
      }
    };

    fetchSellerOrders();
  }, [seller]);

  if (loading || sellerLoading || sellerOrdersLoading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Loading dashboard...
      </div>
    );

  if (!user) return null;

  // Tabs based on role
  const tabs =
    user.role === "seller"
      ? [
          "overview",
          "orders",
          "add product",
          "shop",
          "account",
          "notifications",
        ]
      : ["overview", "orders", "wishlist", "account", "notifications"];

  const handleShopCreated = (newSeller: any) => setSeller(newSeller);

  // Metrics
  const totalOrders = sellerOrders.length;
  const activeDeliveries = sellerOrders.filter(
    (o) => o.status !== "Delivered"
  ).length;
  const totalRevenue = sellerOrders
    .reduce((sum, o) => sum + o.total_price, 0)
    .toFixed(2);

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          showMobileMenu={showMobileMenu}
          setShowMobileMenu={setShowMobileMenu}
          tabs={tabs}
        />

        <section className="col-span-12 lg:col-span-9 xl:col-span-10 space-y-8">
          {/* Hero */}
          <HeroSection
            userName={user.full_name}
            onViewOrders={() => setActiveTab("orders")}
            onAddProduct={() => setActiveTab("add product")}
            isVerified={user.verified}
            accountType={user.role}
          />

          {/* Metrics */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon={ShoppingBag}
              label="Total Orders"
              value={totalOrders.toString()}
            />
            <MetricCard
              icon={Truck}
              label="Active Deliveries"
              value={activeDeliveries.toString()}
            />
            <MetricCard
              icon={CreditCard}
              label="Total Earned"
              value={`ETB ${totalRevenue}`}
            />
            <MetricCard
              icon={Heart}
              label={user.role === "seller" ? "Shop Items" : "Wishlist"}
              value={
                user.role === "seller" && seller
                  ? seller.products_count?.toString() || "0"
                  : "3"
              }
            />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Side */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <DashboardContent
                activeTab={activeTab}
                user={user}
                seller={seller}
                orders={sellerOrders}
                notifications={notifications}
                onShopCreated={handleShopCreated}
              />

              {/* Add Product */}
              {activeTab === "add product" && (
                <Card>
                  <h3 className="text-lg font-semibold mb-3">Add Product</h3>
                  <AddProductForm />
                </Card>
              )}
            </div>

            {/* Right Side */}
            <aside className="col-span-12 lg:col-span-4 space-y-6">
              <Card>
                <h4 className="text-sm font-semibold mb-2">Profile</h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#cce0ff] text-[#3399FF] flex items-center justify-center font-semibold text-lg">
                    {user.full_name[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{user.full_name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>
              </Card>

              <Card>
                <h4 className="text-sm font-semibold mb-2">Quick Actions ⚡</h4>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-left px-3 py-2 rounded-md hover:bg-gray-50 flex items-center gap-2 transition"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#3399FF]" /> View
                    Orders
                  </button>
                  {user.role === "seller" && (
                    <button
                      onClick={() => setActiveTab("shop")}
                      className="text-left px-3 py-2 rounded-md hover:bg-gray-50 flex items-center gap-2 transition"
                    >
                      🏪 Manage Shop
                    </button>
                  )}
                </div>
              </Card>

              <Card>
                <h4 className="text-sm font-semibold mb-2">
                  Recent Notifications 🔔
                </h4>
                <ul className="space-y-2 text-sm">
                  {notifications.slice(0, 3).map((n) => (
                    <li key={n.id} className="text-gray-700">
                      {n.message}
                      <div className="text-xs text-gray-400">{n.date}</div>
                    </li>
                  ))}
                </ul>
              </Card>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
