"use client";
import Header from "@/components/UI/header";
import { useEffect, useState } from "react";

interface UserData {
  id: number;
  full_name: string;
  email: string;
  role: "buyer" | "seller" | "admin";
  phone_number: string;
}

interface SellerData {
  id: number;
  user_id: number;
  shop_name: string;
  is_verified: boolean;
}

export default function Dashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [seller, setSeller] = useState<SellerData | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [loadingSeller, setLoadingSeller] = useState(true);
  const [error, setError] = useState("");

  // Fetch user dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("http://localhost:5000/dashboard", {
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.msg || "Failed to fetch dashboard");
          setLoading(false);
          return;
        }

        setUser(data.user || data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Server error. Try again later.");
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Fetch seller info if user is a seller
  useEffect(() => {
    if (user?.role === "seller") {
      const fetchSeller = async () => {
        try {
          const res = await fetch(`http://localhost:5000/sellers/${user.id}`);
          if (res.status === 404) {
            setSeller(null); // seller not created yet
         
          } else {
            const data = await res.json();
            setSeller(data); // seller exists
          }
        } catch (err) {
          console.error(err);
          setSeller(null);
        } finally {
          setLoadingSeller(false);
        }
      };
      fetchSeller();
    } else {
      setLoadingSeller(false);
    }
  }, [user]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Header />
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>
        <strong>Name:</strong> {user?.full_name}
      </p>
      <p>
        <strong>Email:</strong> {user?.email}
      </p>
      <p>
        <strong>Phone:</strong> {user?.phone_number}
      </p>
      <p>
        <strong>Role:</strong> {user?.role}
      </p>

      {user?.role === "admin" && <p>Welcome, Admin! You can manage the platform.</p>}

      {user?.role === "buyer" && <p>Welcome, Buyer! Browse and buy products.</p>}

      {user?.role === "seller" && (
        <>
          {loadingSeller ? (
            <p>Loading shop info...</p>
          ) : seller === undefined ? (
            <p>Loading seller info...</p>
          ) : seller ? (
            seller.is_verified ? (
              <p>Your shop "{seller.shop_name}" is verified ✅</p>
            ) : (
              <p>Your shop "{seller.shop_name}" is pending verification ⏳</p>
            )
          ) : (
            // Only show Create Shop if seller record does NOT exist
            <button
              onClick={() => alert("Redirect to Create Shop Form")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Create Your Shop
            </button>
          )}
        </>
      )}
    </div>
  );
}
