"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopHeader from "@/components/Layout/Topheader/Topheader";
import Navbar from "@/components/Layout/Navbar/Navbar";
import Footer from "@/components/Layout/Footer/Footer";
import LeftPanel from "@/components/Register/Leftpanel";
import RegisterForm from "@/components/Register/RegisterForm";

export default function RegisterPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in by calling backend endpoint that reads cookie
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:5000/auth/me", {
          method: "GET",
          credentials: "include", // important — send cookies
        });

        // if backend responds OK (200) we assume authenticated
        if (res.ok) {
          router.push("/try2"); // or your dashboard route
          return;
        }

        // not authenticated -> show register page
        setCheckingAuth(false);
      } catch (err) {
        console.error("Auth check failed:", err);
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  // handler passed to your RegisterForm (keeps your existing form behaviour)
  const handleSubmit = async (data: any) => {
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // optional for register, but harmless & consistent
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        // show error in page-level container (your form may also show its own messages)
        setError(result.msg || result.errors?.[0]?.msg || "Registration failed");
        return { success: false, message: result.msg || "Registration failed" };
      }

      // on success redirect to login (or directly to dashboard if you log them in automatically)
      router.push("/login");
      return { success: true, message: "Registered successfully" };
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again later.");
      return { success: false, message: "Server error" };
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Checking authentication...
      </div>
    );
  }

  return (
    <>
    
      <div className="min-h-screen font-dm-sans flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl flex flex-col lg:flex-row shadow-xl bg-white rounded-2xl overflow-hidden">
          <LeftPanel />
          <div className="lg:w-1/2 p-10 bg-white flex flex-col justify-center space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <RegisterForm onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
   
    </>
  );
}
