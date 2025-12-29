"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { X, AlertCircle, CheckCircle } from "lucide-react";
import LeftPanel from "@/components/Login/Leftpanel";
import LoginForm from "@/components/Login/LoginForm";
import { AuthContext } from "@/context/Authcontext";

// Toast Component
const Toast = ({ 
  message, 
  type = 'error',
  onClose 
}: { 
  message: string; 
  type: 'success' | 'error';
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const iconColor = type === 'success' ? 'text-green-600' : 'text-red-600';
  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm animate-slide-in">
      <div className={`${bgColor} border rounded-xl p-4 shadow-lg flex items-start gap-3`}>
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
        <div className="flex-1">
          <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const { user, setUser, loading: authLoading } = useContext(AuthContext);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "admin") router.replace("/dashboard");
      else if (user.role === "seller") router.replace("/dashboard");
      else router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const showToast = (message: string, type: 'success' | 'error' = 'error') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  // 🔐 Handle login submit
  const handleSubmit = async (data: { email: string; password: string }) => {
    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        showToast(result.msg || "Invalid email or password");
        return;
      }

      // ✅ Save user in context
      setUser(result.user);
      
      // Show success toast
      showToast(`Welcome back, ${result.user.name || result.user.email}!`, 'success');
      

      setTimeout(() => {
        if (result.user.role === "admin") router.push("/admin/dashboard");
        else if (result.user.role === "seller") router.push("/dashboard");
        else router.push("/dashboard");
      }, 1500);

    } catch (err) {
      console.error(err);
      showToast("Network error. Please try again.");
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
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      <div className="w-full max-w-5xl flex flex-col lg:flex-row shadow-xl bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        {/* Left Panel */}
        <LeftPanel />

        {/* Login Form */}
        <div className="lg:w-1/2 w-full p-10 bg-white flex flex-col justify-center space-y-6">
          <LoginForm onSubmit={handleSubmit} />

          <div className="mt-2 text-center text-sm text-gray-500">
            <p>
              Don't have an account?{" "}
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
      
      {/* Add CSS for animation */}
      <style jsx global>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}