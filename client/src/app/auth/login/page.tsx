"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import LeftPanel from "@/components/Login/Leftpanel";
import LoginForm from "@/components/Login/LoginForm";
import { AuthContext } from "@/context/Authcontext";

export default function LoginPage() {
  const router = useRouter();
  const { user, setUser, loading: authLoading } = useContext(AuthContext);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "admin") router.replace("/dashboard");
      else if (user.role === "seller") router.replace("/dashboard");
      else router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  // 🔐 Handle login submit
  const handleSubmit = async (data: { email: string; password: string }) => {
    setError(null);

    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // send cookies
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.msg || "Invalid credentials");
        return;
      }

      // ✅ Save user in context
      setUser(result.user);

      // Redirect based on role
      if (result.user.role === "admin") router.push("/admin/dashboard");
      else if (result.user.role === "seller") router.push("/seller/dashboard");
      else router.push("/buyer/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  // Show loading if auth context is still fetching user
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Checking session...
      </div>
    );
  }

  return (
    <div className="min-h-screen font-dm-sans flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row shadow-xl bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        {/* Left Panel */}
        <LeftPanel />

        {/* Login Form */}
        <div className="lg:w-1/2 w-full p-10 bg-white flex flex-col justify-center space-y-6">
          <LoginForm onSubmit={handleSubmit} />

          {error && (
            <p className="text-red-600 font-medium text-center bg-red-50 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="mt-2 text-center text-sm text-gray-500">
            <p>
              Don’t have an account?{" "}
              <a
                href="/register"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Register here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
