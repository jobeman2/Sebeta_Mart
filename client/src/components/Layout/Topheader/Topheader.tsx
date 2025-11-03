"use client";

import { useContext, useState } from "react";
import { Phone, UserPlus, LogIn, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthContext } from "@/context/Authcontext";

export default function TopHeader() {
  const { user, setUser, loading } = useContext(AuthContext);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("http://localhost:5000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="w-full bg-[#F5F6F9] font-dm-sans text-gray-700 text-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-2">
        {/* Left Section - Contact */}
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-600" />
          <span>+251 4665 1200</span>
        </div>

        {/* Right Section - Auth / Lang */}
        <div className="flex items-center gap-4">
          <select className="bg-transparent outline-none cursor-pointer">
            <option value="en">ENG</option>
            <option value="oro">ORO</option>
          </select>
          <span className="text-gray-400">|</span>

          {loading ? (
            <div className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div>
          ) : user ? (
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-1 hover:underline"
            >
              <LogOut className="w-4 h-4" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          ) : (
            <>
              <Link
                href="/auth/register"
                className="flex items-center gap-1 hover:underline"
              >
                <UserPlus className="w-4 h-4" />
                Sign Up
              </Link>
              <span className="text-gray-400">|</span>
              <Link
                href="/auth/login"
                className="flex items-center gap-1 hover:underline"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
