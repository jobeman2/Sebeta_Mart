"use client";
import { useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/Authcontext";

export default function Header() {
  const router = useRouter();
  const { user, setUser, loading } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:5000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setUser(null); // update global state
        router.push("/login");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="flex justify-between items-center p-4 bg-gray-100 shadow">
      <h1 className="text-xl font-bold">My Multi-Vendor Shop</h1>

      {loading ? (
        <span>Loading...</span>
      ) : user ? (
        <div className="flex items-center gap-4">
          <span>Welcome, {user.full_name.split(" ")[0]}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={() => router.push("/login")}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Login
        </button>
      )}
    </header>
  );
}
