"use client";

import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/Authcontext";
import DashboardHeader from "@/components/Dash/DashboardHeader";
import LoadingScreen from "@/components/Dash/LoadingScreen";

// Import seller components
import StatsCards from "@/components/Dash/SellerStatsCards";
import RecentOrders from "@/components/Dash/SellerRecentOrderst";
import PendingActions from "@/components/Dash/SellerPendingActions";
import ShopInfo from "@/components/Dash/ShopInfo";
import PerformanceSummary from "@/components/Dash/SellerPerformanceSummary";

// Import buyer components
import BuyerStatsCards from "@/components/Dash/BuyerStatsCards";
import BuyerRecentOrders from "@/components/Dash/BuyerRecentOrders";
import BuyerPendingActions from "@/components/Dash/BuyerPendingActions";
import BuyerWishlist from "@/components/Dash/BuyerWishlistProps";

// Import delivery components
import DeliveryStatsCards from "@/components/Dash/DeliveryStatsCards";
import DeliveryRecentOrders from "@/components/Dash/DeliveryRecentOrders";
import DeliveryPendingActions from "@/components/Dash/DeliveryPendingActions";
import DeliveryPerformanceSummary from "@/components/Dash/DeliveryPerformanceSummary";

// Define types
interface UserInfo {
  id: string;
  name?: string;
  full_name?: string;
  email: string;
  shop_name?: string;
  location?: string;
  vehicle_type?: string;
  vehicle_number?: string;
  rating?: number;
  completed_deliveries?: number;
}

interface Order {
  id: number | string;
  order_number?: string;
  product_name?: string;
  total_price?: number;
  status?: string;
  created_at?: string;
  estimated_delivery?: string;
  quantity?: number;
  product_price?: number;
  customerName?: string;
  pickupLocation?: string;
  deliveryLocation?: string;
  amount?: number;
  distance?: string;
  items?: OrderItem[];
}

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
}

interface WishlistItem {
  id: number;
  productId: number;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  addedDate: string;
  category: string;
  product_id?: number;
  product_name?: string;
  product_image?: string;
  product_price?: number;
  original_price?: number;
  review_count?: number;
  in_stock?: boolean;
  added_date?: string;
}

interface PendingAction {
  id: number;
  type: string;
  title: string;
  description: string;
  orderId: number;
}

interface Stats {
  totalOrders?: number;
  activeDeliveries?: number;
  totalRevenue?: number;
  avgOrderValue?: number;
  conversionRate?: number;
  customerRating?: number;
  totalSpent?: number;
  pendingOrders?: number;
  completedOrders?: number;
  assignedDeliveries?: number;
  completedToday?: number;
  totalEarnings?: number;
  averageRating?: number;
  onTimeRate?: number;
  totalDeliveries?: number;
}

interface DashboardData {
  userInfo: UserInfo;
  stats: Stats;
  recentOrders: Order[];
  pendingOrders?: Order[];
  wishlistItems?: WishlistItem[];
  pendingActions?: PendingAction[];
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/login");
  }, [user, authLoading, router]);

  // Fetch data based on user role
  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (user.role === "seller") {
          // ORIGINAL SELLER FETCH LOGIC
          const sellerRes = await fetch(
            `http://localhost:5000/sellers/${user.id}`,
            {
              credentials: "include",
            }
          );

          if (!sellerRes.ok) throw new Error("Failed to fetch seller info");
          const sellerData = await sellerRes.json();

          const ordersRes = await fetch("http://localhost:5000/sellerOrders", {
            credentials: "include",
          });

          if (!ordersRes.ok) throw new Error("Failed to fetch seller orders");
          const ordersData: Order[] = await ordersRes.json();

          const totalOrders = ordersData.length;
          const activeDeliveries = ordersData.filter(
            (o: Order) =>
              o.status &&
              !["Delivered", "Cancelled", "Completed"].includes(o.status)
          ).length;
          const totalRevenue = ordersData.reduce(
            (sum: number, o: Order) => sum + Number(o.total_price || 0),
            0
          );
          const avgOrderValue =
            totalOrders > 0 ? totalRevenue / totalOrders : 0;

          setDashboardData({
            userInfo: {
              id: user.id,
              email: user.email,
              ...sellerData,
            },
            stats: {
              totalOrders,
              activeDeliveries,
              totalRevenue,
              avgOrderValue,
              conversionRate: 3.2,
              customerRating: 4.8,
            },
            recentOrders: ordersData.slice(0, 5),
            pendingOrders: ordersData
              .filter((o: Order) => o.status === "Pending")
              .slice(0, 3),
          });
        } else if (user.role === "buyer") {
          // Fetch buyer data
          const buyerRes = await fetch(
            `http://localhost:5000/buyers/${user.id}`,
            {
              credentials: "include",
            }
          );

          if (!buyerRes.ok) throw new Error("Failed to fetch buyer info");
          const buyerData = await buyerRes.json();

          // Fetch buyer orders
          const ordersRes = await fetch("http://localhost:5000/buyer/orders", {
            credentials: "include",
          });

          const ordersData: Order[] = ordersRes.ok
            ? await ordersRes.json()
            : [];

          // Fetch wishlist items
          const wishlistRes = await fetch(
            "http://localhost:5000/buyer/wishlist",
            {
              credentials: "include",
            }
          );

          const wishlistData: WishlistItem[] = wishlistRes.ok
            ? await wishlistRes.json()
            : [];

          // Calculate stats
          const totalOrders = ordersData.length || 0;
          const pendingOrders =
            ordersData.filter((o: Order) =>
              ["pending", "processing", "shipped"].includes(o.status || "")
            ).length || 0;
          const completedOrders =
            ordersData.filter((o: Order) => o.status === "delivered").length ||
            0;
          const totalSpent = ordersData.reduce(
            (sum: number, o: Order) => sum + Number(o.total_price || 0),
            0
          );
          const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

          const formattedWishlistItems: WishlistItem[] = wishlistData.map(
            (item: WishlistItem, i: number) => ({
              id: item.id || i + 1,
              productId: item.product_id || i + 1,
              name: item.product_name || `Product ${i + 1}`,
              image:
                item.product_image ||
                `https://picsum.photos/200?random=${i + 1}`,
              price: item.product_price || 2500 + i * 500,
              originalPrice:
                item.original_price ||
                (Math.random() > 0.5 ? 3500 + i * 500 : undefined),
              rating: item.rating || 4 + Math.random() * 1,
              reviewCount: item.review_count || Math.floor(Math.random() * 100),
              inStock:
                item.in_stock !== undefined
                  ? item.in_stock
                  : Math.random() > 0.2,
              addedDate:
                item.added_date ||
                new Date(Date.now() - i * 86400000).toISOString(),
              category:
                item.category ||
                ["Electronics", "Clothing", "Home", "Books"][i % 4],
            })
          );

          setDashboardData({
            userInfo: {
              id: user.id,
              email: user.email,
              ...buyerData,
            },
            stats: {
              totalOrders,
              totalSpent,
              pendingOrders,
              completedOrders,
              avgOrderValue,
            },
            recentOrders: ordersData
              .slice(0, 5)
              .map((order: Order, i: number) => ({
                id: order.id || i + 1,
                orderNumber: order.order_number || `ORD${2000 + i}`,
                productName: order.product_name || `Product ${i + 1}`,
                total: order.total_price || 1200 + i * 300,
                status:
                  order.status ||
                  ["pending", "processing", "shipped", "delivered"][i % 4],
                date:
                  order.created_at ||
                  new Date(Date.now() - i * 86400000).toISOString(),
                items: [
                  {
                    id: 1,
                    productName: order.product_name || `Product ${i + 1}`,
                    quantity: order.quantity || 1,
                    price: order.product_price || 1200 + i * 300,
                  },
                ],
                deliveryDate: order.estimated_delivery,
              })),
            wishlistItems: formattedWishlistItems,
            pendingActions: [
              {
                id: 1,
                type: "review",
                title: "Leave Review",
                description: "Review your recent purchase",
                orderId: 1,
              },
              {
                id: 2,
                type: "confirmation",
                title: "Confirm Delivery",
                description: "Confirm receipt of your order",
                orderId: 2,
              },
            ],
          });
        } else if (user.role === "delivery") {
          // Mock delivery data
          setDashboardData({
            userInfo: {
              id: user.id,
              name: user.full_name || user.email,
              email: user.email,
              vehicle_type: "Motorcycle",
              vehicle_number: "AA-1234",
              rating: 4.7,
              completed_deliveries: 45,
            },
            stats: {
              assignedDeliveries: 6,
              completedToday: 8,
              totalEarnings: 12500,
              averageRating: 4.7,
              onTimeRate: 92,
              totalDeliveries: 45,
            },
            recentOrders: Array.from({ length: 5 }, (_, i) => ({
              id: i + 1,
              orderNumber: `ORD${3000 + i}`,
              customerName: `Customer ${i + 1}`,
              pickupLocation: `Location ${i + 1}`,
              deliveryLocation: `Delivery ${i + 1}`,
              status: ["assigned", "picked_up", "in_transit", "delivered"][
                i % 4
              ],
              amount: 250 + i * 50,
              distance: `${2 + i} km`,
            })),
            pendingActions: [
              {
                id: 1,
                type: "pickup",
                title: "Pickup Order",
                description: "Order #ORD3001 ready for pickup",
                orderId: 1,
              },
              {
                id: 2,
                type: "delivery",
                title: "Complete Delivery",
                description: "Order #ORD3002 needs delivery",
                orderId: 2,
              },
            ],
          });
        }
      } catch (err: unknown) {
        console.error("Dashboard fetch error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);

        // Fallback data for buyer
        if (user.role === "buyer") {
          const fallbackData: DashboardData = {
            userInfo: {
              id: user.id,
              name: user.full_name || user.email,
              email: user.email,
            },
            stats: {
              totalOrders: 15,
              totalSpent: 45000,
              pendingOrders: 2,
              completedOrders: 12,
              avgOrderValue: 3000,
            },
            recentOrders: Array.from({ length: 5 }, (_, i) => ({
              id: i + 1,
              orderNumber: `ORD${2000 + i}`,
              productName: `Product ${i + 1}`,
              total: 1200 + i * 300,
              status: ["pending", "processing", "shipped", "delivered"][i % 4],
              date: new Date(Date.now() - i * 86400000).toISOString(),
              items: [
                {
                  id: 1,
                  productName: `Product ${i + 1}`,
                  quantity: 1,
                  price: 1200 + i * 300,
                },
              ],
            })),
            wishlistItems: Array.from({ length: 4 }, (_, i) => ({
              id: i + 1,
              productId: i + 1,
              name: `Product ${i + 1}`,
              image: `https://picsum.photos/200?random=${i + 1}`,
              price: 2500 + i * 500,
              originalPrice: Math.random() > 0.5 ? 3500 + i * 500 : undefined,
              rating: 4 + Math.random() * 1,
              reviewCount: Math.floor(Math.random() * 100),
              inStock: Math.random() > 0.2,
              addedDate: new Date(Date.now() - i * 86400000).toISOString(),
              category: ["Electronics", "Clothing", "Home", "Books"][i % 4],
            })),
            pendingActions: [
              {
                id: 1,
                type: "review",
                title: "Leave Review",
                description: "Review your recent purchase",
                orderId: 1,
              },
              {
                id: 2,
                type: "confirmation",
                title: "Confirm Delivery",
                description: "Confirm receipt of Order #ORD2002",
                orderId: 2,
              },
            ],
          };
          setDashboardData(fallbackData);
        } else {
          const baseData: DashboardData = {
            userInfo: {
              id: user.id,
              name: user.full_name || user.email,
              email: user.email,
            },
            stats: {},
            recentOrders: [],
            pendingOrders: [],
            pendingActions: [],
          };
          setDashboardData(baseData);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (authLoading || loading || !dashboardData) {
    return <LoadingScreen />;
  }

  if (error) {
    console.log("Using fallback data due to error:", error);
  }

  // Handler functions for wishlist
  const handleRemoveWishlistItem = (itemId: number) => {
    // In a real app, you would make an API call here
    console.log("Remove item from wishlist:", itemId);
    setDashboardData((prev: DashboardData | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        wishlistItems: prev.wishlistItems?.filter(
          (item: WishlistItem) => item.id !== itemId
        ),
      };
    });
  };

  const handleAddWishlistItemToCart = (item: WishlistItem) => {
    // In a real app, you would make an API call here
    console.log("Add to cart:", item);
    alert(`Added "${item.name}" to cart`);
  };

  const handleViewWishlistProduct = (productId: number) => {
    router.push(`/products/${productId}`);
  };

  // Render dashboard based on user role
  const renderDashboard = () => {
    if (!user) return null;

    switch (user.role) {
      case "seller":
        return (
          <>
            <StatsCards stats={dashboardData.stats} />

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <RecentOrders
                  orders={dashboardData.recentOrders}
                  onViewAll={() => router.push("/seller/orders")}
                  onViewOrder={(orderId) => router.push(`/orders/${orderId}`)}
                />

                {dashboardData.pendingOrders &&
                  dashboardData.pendingOrders.length > 0 && (
                    <PendingActions
                      orders={dashboardData.pendingOrders}
                      onProcessOrder={(orderId) =>
                        router.push(`/orders/${orderId}`)
                      }
                    />
                  )}
              </div>

              <div className="space-y-8">
                <ShopInfo
                  shopName={dashboardData.userInfo?.shop_name}
                  location={dashboardData.userInfo?.location}
                  revenueToday={
                    dashboardData.stats?.totalRevenue &&
                    dashboardData.stats.totalRevenue > 0
                      ? dashboardData.stats.totalRevenue * 0.1
                      : 0
                  }
                  onEditShop={() => router.push("")}
                />

                <PerformanceSummary orders={dashboardData.recentOrders || []} />
              </div>
            </div>
          </>
        );

      case "buyer":
        return (
          <>
            <BuyerStatsCards apiUrl="http://localhost:5000/buyer/orders" />

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Orders & Wishlist */}
              <div className="lg:col-span-2 space-y-8">
                <BuyerRecentOrders
                  orders={dashboardData.recentOrders}
                  onViewAll={() => router.push("/orders")}
                  onViewOrder={(orderId) => router.push(`/orders/${orderId}`)}
                />

                {dashboardData.wishlistItems &&
                  dashboardData.wishlistItems.length > 0 && (
                    <BuyerWishlist
                      items={dashboardData.wishlistItems}
                      onRemoveItem={handleRemoveWishlistItem}
                      onAddToCart={handleAddWishlistItemToCart}
                      onViewProduct={handleViewWishlistProduct}
                    />
                  )}

                {dashboardData.pendingActions &&
                  dashboardData.pendingActions.length > 0 && (
                    <BuyerPendingActions
                      actions={dashboardData.pendingActions}
                      onCompleteAction={(actionId) =>
                        console.log("Complete action:", actionId)
                      }
                    />
                  )}
              </div>

              {/* Right Column - Performance & Quick Links */}
              <div className="space-y-8">
                <div className="bg-white border border-gray-300 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push("/orders")}
                      className="w-full text-left p-3 border border-gray-300 rounded-lg hover:border-[#3399FF] transition-colors group"
                    >
                      <span className="font-medium text-gray-900 group-hover:text-[#3399FF] transition-colors">
                        View All Orders
                      </span>
                    </button>
                    <button
                      onClick={() => router.push("/products")}
                      className="w-full text-left p-3 border border-gray-300 rounded-lg hover:border-[#3399FF] transition-colors group"
                    >
                      <span className="font-medium text-gray-900 group-hover:text-[#3399FF] transition-colors">
                        Continue Shopping
                      </span>
                    </button>
                    <button
                      onClick={() => router.push("/profile")}
                      className="w-full text-left p-3 border border-gray-300 rounded-lg hover:border-[#3399FF] transition-colors group"
                    >
                      <span className="font-medium text-gray-900 group-hover:text-[#3399FF] transition-colors">
                        Edit Profile
                      </span>
                    </button>
                    <button
                      onClick={() => router.push("/wishlist")}
                      className="w-full text-left p-3 border border-[#EF837B]/30 rounded-lg hover:border-[#EF837B] transition-colors group"
                    >
                      <span className="font-medium text-gray-900 group-hover:text-[#EF837B] transition-colors">
                        View Full Wishlist
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case "delivery":
        return (
          <>
            <DeliveryStatsCards stats={dashboardData.stats} />

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <DeliveryRecentOrders
                  deliveries={dashboardData.recentOrders}
                  onViewAll={() => router.push("/delivery/tasks")}
                  onViewDelivery={(deliveryId) =>
                    router.push(`/delivery/${deliveryId}`)
                  }
                />

                {dashboardData.pendingActions &&
                  dashboardData.pendingActions.length > 0 && (
                    <DeliveryPendingActions
                      actions={dashboardData.pendingActions}
                      onCompleteAction={(actionId) =>
                        console.log("Complete action:", actionId)
                      }
                    />
                  )}
              </div>

              <div className="space-y-8">
                <DeliveryPerformanceSummary
                  metrics={[]}
                  stats={dashboardData.stats}
                />

                <div className="bg-white border border-gray-300 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Delivery Info
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Vehicle Type</p>
                      <p className="font-medium text-gray-900">
                        {dashboardData.userInfo?.vehicle_type ||
                          "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Vehicle Number</p>
                      <p className="font-medium text-gray-900">
                        {dashboardData.userInfo?.vehicle_number ||
                          "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Rating</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-gray-900">
                          {dashboardData.userInfo?.rating || "4.5"}
                        </span>
                        <span className="text-gray-500">/5.0</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-300">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Quick Actions
                    </h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => router.push("/delivery/tasks")}
                        className="w-full text-left p-2 text-sm text-[#3399FF] hover:bg-gray-50 rounded transition-colors"
                      >
                        View All Deliveries
                      </button>
                      <button
                        onClick={() => router.push("/delivery/earnings")}
                        className="w-full text-left p-2 text-sm text-[#3399FF] hover:bg-gray-50 rounded transition-colors"
                      >
                        Check Earnings
                      </button>
                      <button
                        onClick={() => router.push("/delivery/settings")}
                        className="w-full text-left p-2 text-sm text-[#3399FF] hover:bg-gray-50 rounded transition-colors"
                      >
                        Update Availability
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Role Not Supported
            </h2>
            <p className="text-gray-500">
              Your user role ({user.role}) doesn't have a dashboard yet.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        shopName={
          dashboardData.userInfo?.shop_name ||
          dashboardData.userInfo?.name ||
          "Dashboard"
        }
        sellerId={user?.id}
        userRole={user?.role}
      />

      <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {renderDashboard()}
      </main>
    </div>
  );
}
