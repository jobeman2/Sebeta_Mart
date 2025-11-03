"use client";

import {
  LogOut,
  Package,
  ShoppingBag,
  Heart,
  Home,
  Settings,
  Bell,
  Plus, 
} from "lucide-react";
import NavItem from "./NavItem";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showMobileMenu: boolean;
  setShowMobileMenu: (show: boolean) => void;
  tabs: string[];
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  showMobileMenu,
  setShowMobileMenu,
  tabs,
}) => {
  // 🧩 Icon mapping
  const getIcon = (tab: string) => {
    switch (tab) {
      case "overview":
        return Package;
      case "orders":
        return ShoppingBag;
      case "add product": 
        return Plus;
      case "wishlist":
        return Heart;
      case "shop":
        return Home;
      case "account":
        return Settings;
      default:
        return Bell;
    }
  };

  // 🧭 Capitalize each word nicely
  const formatLabel = (label: string) =>
    label
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <aside
      className={`col-span-12 lg:col-span-3 xl:col-span-2 bg-white rounded-xl p-4 border border-gray-200 shadow-sm ${
        showMobileMenu ? "block" : "hidden lg:block"
      }`}
    >
      <nav className="space-y-4">
        <div className="text-xs uppercase tracking-wide text-gray-400 px-2">Menu</div>

        {tabs.map((tab) => {
          const Icon = getIcon(tab);
          return (
            <NavItem
              key={tab}
              icon={Icon}
              label={formatLabel(tab)}
              active={activeTab === tab}
              onClick={() => {
                setActiveTab(tab);
                setShowMobileMenu(false);
              }}
            />
          );
        })}

    
        <div className="pt-4 mt-4 border-t border-gray-200">
          <button className="w-full text-left text-sm flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition">
            <LogOut className="w-4 h-4 text-gray-600" />
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
