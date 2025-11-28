"use client";
import { useEffect, useState } from "react";

export default function DeliveryDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch delivery profile
  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/delivery/profile", {
        credentials: "include",
      });
      if (res.status === 404) {
        setProfile(null); // profile does not exist
      } else if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Error fetching profile");
      } else {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error(err);
      setError("Server error fetching profile");
    } finally {
      setLoading(false);
    }
  };

  // Toggle online/offline availability
  const toggleAvailability = async () => {
    if (!profile) return;
    try {
      const res = await fetch("http://localhost:5000/delivery/toggle-availability", {
        method: "PATCH",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Error updating availability");
      } else {
        const data = await res.json();
        setProfile(data.profile);
      }
    } catch (err) {
      console.error(err);
      alert("Server error updating availability");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded flex flex-col gap-4">
      {!profile ? (
        <div>
          <h2 className="text-xl font-semibold mb-2">No profile found</h2>
          <p>Please create your delivery profile first.</p>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">Delivery Profile</h1>

          {profile.profile_image && (
            <div className="mb-2">
              <p className="font-semibold">Profile Image:</p>
              <img
                src={profile.profile_image}
                className="w-32 h-32 rounded object-cover"
                alt="Profile"
              />
            </div>
          )}

          {profile.id_card_image && (
            <div className="mb-2">
              <p className="font-semibold">ID Card Image:</p>
              <img
                src={profile.id_card_image}
                className="w-32 h-32 rounded object-cover"
                alt="ID Card"
              />
            </div>
          )}

          <p><strong>Vehicle Type:</strong> {profile.vehicle_type}</p>
          <p><strong>Plate Number:</strong> {profile.plate_number || "N/A"}</p>
          <p><strong>National ID:</strong> {profile.national_id}</p>
          <p><strong>Availability:</strong> {profile.availability_status}</p>

          <button
            onClick={toggleAvailability}
            className={`px-4 py-2 mt-4 rounded text-white ${
              profile.availability_status === "online" ? "bg-red-600" : "bg-green-600"
            }`}
          >
            {profile.availability_status === "online" ? "Go Offline" : "Go Online"}
          </button>
        </>
      )}
    </div>
  );
}
