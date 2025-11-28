"use client";
import { useEffect, useState } from "react";

export default function DeliverySetupPage() {
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({
    vehicle_type: "",
    plate_number: "",
    license_number: "",
    national_id: "",
    profile_image: null as File | null,
    id_card_image: null as File | null,
  });
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState({
    profile_image: "",
    id_card_image: "",
  });

  // Fetch existing delivery profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/delivery/profile", { credentials: "include" });
        if (res.status === 404) {
          setProfile(null);
        } else {
          const data = await res.json();
          setProfile(data);
          setForm({
            vehicle_type: data.vehicle_type || "",
            plate_number: data.plate_number || "",
            license_number: data.license_number || "",
            national_id: data.national_id || "",
            profile_image: null,
            id_card_image: null,
          });
          setPreview({
            profile_image: data.profile_image ? `http://localhost:5000/${data.profile_image}` : "",
            id_card_image: data.id_card_image ? `http://localhost:5000/${data.id_card_image}` : "",
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: "profile_image" | "id_card_image") => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm({ ...form, [field]: file });
      setPreview({ ...preview, [field]: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // National ID validation
    if (!/^\d{16}$/.test(form.national_id)) {
      alert("National ID must be exactly 16 digits");
      return;
    }

    try {
      const url = profile ? "update" : "activate";
      const formData = new FormData();
      formData.append("vehicle_type", form.vehicle_type);
      formData.append("plate_number", form.plate_number);
      formData.append("license_number", form.license_number);
      formData.append("national_id", form.national_id);

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
        // reset local files after upload
        setForm({ ...form, profile_image: null, id_card_image: null });
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Vehicle Type"
          value={form.vehicle_type}
          onChange={e => setForm({ ...form, vehicle_type: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Plate Number"
          value={form.plate_number}
          onChange={e => setForm({ ...form, plate_number: e.target.value })}
        />
        <input
          type="text"
          placeholder="License Number"
          value={form.license_number}
          onChange={e => setForm({ ...form, license_number: e.target.value })}
        />
        <input
          type="text"
          placeholder="National ID (16 digits)"
          maxLength={16}
          value={form.national_id}
          onChange={e => setForm({ ...form, national_id: e.target.value.replace(/\D/g, "") })}
          required
        />

        {/* File uploads */}
        <div>
          <label className="block mb-1 font-semibold">Profile Image</label>
          <input type="file" accept="image/*" onChange={e => handleFileChange(e, "profile_image")} />
          {preview.profile_image && (
            <img src={preview.profile_image} alt="Profile Preview" className="mt-2 w-32 h-32 object-cover rounded" />
          )}
        </div>

        <div>
          <label className="block mb-1 font-semibold">ID Card Image</label>
          <input type="file" accept="image/*" onChange={e => handleFileChange(e, "id_card_image")} />
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
