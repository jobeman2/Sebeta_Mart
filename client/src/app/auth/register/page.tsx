"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopHeader from "@/components/Layout/Topheader/Topheader";
import Navbar from "@/components/Layout/Navbar/Navbar";
import Footer from "@/components/Layout/Footer/Footer";
import LeftPanel from "@/components/Register/Leftpanel";
import RegisterForm from "@/components/Register/RegisterForm";

// Define types for registration data
interface RegisterFormData {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  [key: string]: any; // Allow for other form fields if needed
}

interface RegisterResponse {
  success: boolean;
  message: string;
}

interface AuthCheckResponse {
  [key: string]: any; // Allow any response structure from /auth/me
}

export default function RegisterPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in by calling backend endpoint that reads cookie
    const checkAuth = async (): Promise<void> => {
      try {
        const res = await fetch("http://localhost:5000/auth/me", {
          method: "GET",
          credentials: "include",
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
  const handleSubmit = async (
    data: RegisterFormData
  ): Promise<RegisterResponse> => {
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // optional for register, but harmless & consistent
        body: JSON.stringify(data),
      });

      const result: any = await res.json();

      if (!res.ok) {
        // show error in page-level container (your form may also show its own messages)
        const errorMessage =
          result.msg || result.errors?.[0]?.msg || "Registration failed";
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }

      // on success redirect to login (or directly to dashboard if you log them in automatically)
      router.push("/login");
      return { success: true, message: "Registered successfully" };
    } catch (err) {
      console.error(err);
      const errorMessage = "Server error. Please try again later.";
      setError(errorMessage);
      return { success: false, message: errorMessage };
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
      {/* Header and Navigation - uncomment if you want to use them */}
      {/* <TopHeader />
      <Navbar /> */}

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

      <Footer />
    </>
  );
}
