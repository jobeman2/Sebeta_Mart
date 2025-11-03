"use client";

import Card from "./Card";
import CreateShopForm from "@/components/forms/CreateShop";

interface DashboardContentProps {
  activeTab: string;
  user: any;
  seller: any;
  orders: any[];
  notifications: any[];
  onShopCreated: (seller: any) => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  activeTab,
  user,
  seller,
  orders,
  notifications,
  onShopCreated,
}) => {
  if (activeTab === "overview")
    return (
      <Card>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-sm text-gray-500">Quick snapshot of your recent activity.</p>
      </Card>
    );

  if (activeTab === "orders")
    return (
      <Card>
        <h3 className="text-lg font-semibold mb-3">Recent Orders</h3>
        <table className="min-w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="py-2 text-left">Order</th>
              <th className="py-2 text-left">Location</th>
              <th className="py-2 text-left">Date</th>
              <th className="py-2 text-right">Total</th>
              <th className="py-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 font-medium">{o.id}</td>
                <td>{o.location}</td>
                <td>{o.date}</td>
                <td className="text-right">ETB {o.price.toFixed(2)}</td>
                <td className="text-right">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      o.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : o.status === "In Transit"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    );

  if (activeTab === "wishlist")
    return (
      <Card>
        <h3 className="text-lg font-semibold mb-2">Wishlist</h3>
        <p className="text-sm text-gray-500">You have 3 items in your wishlist.</p>
      </Card>
    );

  if (activeTab === "shop")
    return (
      <Card>
        <h3 className="text-lg font-semibold mb-3">Shop Info</h3>
        {seller ? (
          <>
            <div className="font-medium">{seller.shop_name}</div>
            <div className="text-sm mt-2">
              Status:{" "}
              {seller.is_verified ? (
                <span className="text-green-600">Verified</span>
              ) : (
                <span className="text-yellow-600">Pending Verification</span>
              )}
            </div>
          </>
        ) : (
          <CreateShopForm userId={user.id} onShopCreated={onShopCreated} />
        )}
      </Card>
    );

  if (activeTab === "account")
    return (
      <Card>
        <h3 className="text-lg font-semibold mb-2">Account Settings</h3>
        <p className="text-sm text-gray-500">Manage your profile and preferences.</p>
      </Card>
    );

  if (activeTab === "notifications")
    return (
      <Card>
        <h3 className="text-lg font-semibold mb-3">Notifications</h3>
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li key={n.id} className="p-3 bg-gray-50 rounded-md border border-gray-200">
              <div className="flex justify-between items-center">
                <div>{n.message}</div>
                <span className="text-xs text-gray-400">{n.date}</span>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    );

  return null;
};

export default DashboardContent;
