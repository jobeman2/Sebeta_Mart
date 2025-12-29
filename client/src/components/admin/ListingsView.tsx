"use client";

import { useState, useEffect } from "react";
import {
  UserPlus,
  User,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
} from "lucide-react";

interface Clerk {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
  created_at: string;
  status: "active" | "inactive";
  password: string; // visible password
}

interface NewClerkForm {
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
}

export function ListingsView() {
  const [clerks, setClerks] = useState<Clerk[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const [newClerk, setNewClerk] = useState<NewClerkForm>({
    full_name: "",
    email: "",
    phone_number: "",
    role: "city_clerk",
  });

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Auto-generate random password
  const generatePassword = (length = 8) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    let pwd = "";
    for (let i = 0; i < length; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  };

  const handleAddClerk = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!newClerk.full_name || !newClerk.email || !newClerk.phone_number) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    const password = generatePassword();

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/admin/register-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ ...newClerk, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to add clerk");

      showToast(`Clerk added! Password: ${password}`, "success");

      const addedClerk: Clerk = {
        id: data.user.id,
        full_name: newClerk.full_name,
        email: newClerk.email,
        phone_number: newClerk.phone_number,
        role: newClerk.role,
        status: "active",
        created_at: new Date().toISOString(),
        password,
      };

      setClerks([...clerks, addedClerk]);

      setNewClerk({
        full_name: "",
        email: "",
        phone_number: "",
        role: "city_clerk",
      });
    } catch (err: any) {
      showToast(err.message || "Failed to add clerk", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg flex items-center gap-3 animate-slideIn ${
            toast.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : toast.type === "error"
              ? "bg-red-50 border border-red-200 text-red-800"
              : "bg-blue-50 border border-blue-200 text-blue-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : toast.type === "error" ? (
            <XCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Clerk</h2>

      <form onSubmit={handleAddClerk} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={newClerk.full_name}
              onChange={(e) =>
                setNewClerk({ ...newClerk, full_name: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900"
              placeholder="Enter full name"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={newClerk.email}
              onChange={(e) =>
                setNewClerk({ ...newClerk, email: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900"
              placeholder="Enter email"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={newClerk.phone_number}
              onChange={(e) =>
                setNewClerk({ ...newClerk, phone_number: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900"
              placeholder="Enter phone number"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={newClerk.role}
              onChange={(e) =>
                setNewClerk({ ...newClerk, role: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900"
            >
              <option value="city_clerk">City Clerk</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full px-6 py-4 font-bold rounded-lg ${
            loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gray-900 text-white hover:bg-gray-800"
          }`}
        >
          <UserPlus className="inline w-5 h-5 mr-2" />
          {loading ? "Adding Clerk..." : "Add Clerk"}
        </button>
      </form>

      {/* Recently Added Clerks */}
      {clerks.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recently Added Clerks
          </h3>
          <div className="space-y-4">
            {clerks.map((clerk) => (
              <div
                key={clerk.id}
                className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {clerk.full_name}
                    </p>
                    <p className="text-sm text-gray-600">{clerk.email}</p>
                    <p className="text-xs text-gray-500">
                      Password: {clerk.password}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    clerk.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {clerk.status.charAt(0).toUpperCase() + clerk.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
