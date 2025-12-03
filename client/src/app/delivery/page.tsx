"use client";
import { useEffect, useState } from "react";

interface SubCity {
  id: number;
  name: string;
}

interface DeliveryForm {
  vehicle_type: string;
  plate_number: string;
  license_number: string;
  national_id: string;
  profile_image: File | null;
  id_card_image: File | null;
  subcity_id: string;
  city: string;
  region: string;
  latitude: string;
  longitude: string;
}

export default function DeliverySetupPage() {
  const [profile, setProfile] = useState<any>(null);
  const [subCities, setSubCities] = useState<SubCity[]>([]);
  const [form, setForm] = useState<DeliveryForm>({
    vehicle_type: "",
    plate_number: "",
    license_number: "",
    national_id: "",
    profile_image: null,
    id_card_image: null,
    subcity_id: "",
    city: "",
    region: "",
    latitude: "",
    longitude: "",
  });
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState({ profile_image: "", id_card_image: "" });
  const [geoError, setGeoError] = useState<string | null>(null);

  // Fetch subcities
  const fetchSubCities = async () => {
    try {
      const res = await fetch("http://localhost:5000/delivery/subcities", { credentials: "include" });
      const data = await res.json();
      setSubCities(data.subcities || []);
    } catch (err) {
      console.error("Failed to fetch subcities", err);
    }
  };

  // Fetch existing profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/delivery/profile", { credentials: "include" });
        if (res.status === 404) {
          setProfile(null);
        } else {
          const data = await res.json();
          setProfile(data);
          setForm((prev) => ({
            ...prev,
            vehicle_type: data.vehicle_type || "",
            plate_number: data.plate_number || "",
            license_number: data.license_number || "",
            national_id: data.national_id || "",
            subcity_id: data.subcity_id || "",
            city: data.city || "",
            region: data.region || "",
            latitude: data.latitude?.toString() || "",
            longitude: data.longitude?.toString() || "",
          }));
          setPreview({
            profile_image: data.profile_image || "",
            id_card_image: data.id_card_image || "",
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    fetchSubCities();

    // Get user's geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setForm((f) => ({
            ...f,
            latitude: pos.coords.latitude.toString(),
            longitude: pos.coords.longitude.toString(),
          })),
        (err) => {
          console.error("Geolocation error:", err);
          setGeoError("Unable to detect location");
        }
      );
    } else {
      setGeoError("Geolocation is not supported by this browser");
    }
  }, []);

  // Handle file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: "profile_image" | "id_card_image") => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm({ ...form, [field]: file });
      setPreview({ ...preview, [field]: URL.createObjectURL(file) });
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{16}$/.test(form.national_id)) {
      alert("National ID must be exactly 16 digits");
      return;
    }

    if (!form.latitude || !form.longitude) {
      alert("Location not detected. Please allow location access.");
      return;
    }

    try {
      const url = profile ? "update" : "activate";
      const formData = new FormData();

      // Append only relevant fields
      formData.append("vehicle_type", form.vehicle_type);
      formData.append("plate_number", form.plate_number);
      formData.append("license_number", form.license_number);
      formData.append("national_id", form.national_id);
      formData.append("subcity_id", form.subcity_id);
      formData.append("city", form.city);
      formData.append("region", form.region);
      formData.append("latitude", form.latitude);
      formData.append("longitude", form.longitude);
      if (form.profile_image) formData.append("profile_image", form.profile_image);
      if (form.id_card_image) formData.append("id_card_image", form.id_card_image);

      const res = await fetch(`http://localhost:5000/delivery/${url}`, {
        method: profile ? "PATCH" : "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setProfile(data.profile);
        setForm((prev) => ({ ...prev, profile_image: null, id_card_image: null }));
      } else {
        alert(data.message || "Error saving profile");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Delivery Profile</h1>
      {geoError && <p className="text-red-600 mb-2">{geoError}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Vehicle Type"
          value={form.vehicle_type}
          onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Plate Number"
          value={form.plate_number}
          onChange={(e) => setForm({ ...form, plate_number: e.target.value })}
        />
        <input
          type="text"
          placeholder="License Number"
          value={form.license_number}
          onChange={(e) => setForm({ ...form, license_number: e.target.value })}
        />
        <input
          type="text"
          placeholder="National ID (16 digits)"
          maxLength={16}
          value={form.national_id}
          onChange={(e) => setForm({ ...form, national_id: e.target.value.replace(/\D/g, "") })}
          required
        />

        {/* Subcity dropdown */}
        <select
          value={form.subcity_id}
          onChange={(e) => setForm({ ...form, subcity_id: e.target.value })}
          required
        >
          <option value="">Select Subcity</option>
          {subCities.map((sc) => (
            <option key={sc.id} value={sc.id}>
              {sc.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="City"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Region"
          value={form.region}
          onChange={(e) => setForm({ ...form, region: e.target.value })}
          required
        />
        <input type="text" placeholder="Latitude" value={form.latitude} readOnly className="bg-gray-100" />
        <input type="text" placeholder="Longitude" value={form.longitude} readOnly className="bg-gray-100" />

        {/* File uploads */}
        <div>
          <label className="block mb-1 font-semibold">Profile Image</label>
          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "profile_image")} />
          {preview.profile_image && (
            <img src={preview.profile_image} alt="Profile Preview" className="mt-2 w-32 h-32 object-cover rounded" />
          )}
        </div>

        <div>
          <label className="block mb-1 font-semibold">ID Card Image</label>
          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "id_card_image")} />
          {preview.id_card_image && (
            <img src={preview.id_card_image} alt="ID Card Preview" className="mt-2 w-32 h-32 object-cover rounded" />
          )}
        </div>

        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          {profile ? "Update Profile" : "Activate Profile"}
        </button>
      </form>
    </div>
  );
}
