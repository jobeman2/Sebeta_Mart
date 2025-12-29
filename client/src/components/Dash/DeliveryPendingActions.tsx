"use client";
import { useEffect, useState } from "react";
import { 
  User, 
  Truck, 
  Hash, 
  IdCard, 
  MapPin, 
  Navigation, 
  Upload, 
  Camera,
  Globe,
  Building,
  Map,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";

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

// Toast Component
const Toast = ({ 
  message, 
  type = 'success',
  onClose 
}: { 
  message: string; 
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch(type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-gray-900" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-gray-900" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-gray-900" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-900" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full animate-slide-in">
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 transition-colors"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

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
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState({ profile_image: "", id_card_image: "" });
  const [geoError, setGeoError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  // Fetch subcities
  const fetchSubCities = async () => {
    try {
      const res = await fetch("http://localhost:5000/delivery/subcities", { credentials: "include" });
      const data = await res.json();
      setSubCities(data.subcities || []);
    } catch (err) {
      console.error("Failed to fetch subcities", err);
      showToast("Failed to load subcities", 'error');
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
        showToast("Failed to load profile", 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    fetchSubCities();

    // Get user's geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((f) => ({
            ...f,
            latitude: pos.coords.latitude.toString(),
            longitude: pos.coords.longitude.toString(),
          }));
        },
        (err) => {
          console.error("Geolocation error:", err);
          setGeoError("Unable to detect location. Please enable location services.");
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
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showToast("File size must be less than 5MB", 'error');
        return;
      }
      setForm({ ...form, [field]: file });
      setPreview({ ...preview, [field]: URL.createObjectURL(file) });
    }
  };

  // Remove image
  const handleRemoveImage = (field: "profile_image" | "id_card_image") => {
    setForm({ ...form, [field]: null });
    setPreview({ ...preview, [field]: "" });
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate National ID
    if (!/^\d{16}$/.test(form.national_id)) {
      showToast("National ID must be exactly 16 digits", 'error');
      return;
    }

    // Validate location
    if (!form.latitude || !form.longitude) {
      showToast("Location not detected. Please allow location access.", 'error');
      return;
    }

    // Validate required fields
    if (!form.vehicle_type || !form.city || !form.region || !form.subcity_id) {
      showToast("Please fill all required fields", 'error');
      return;
    }

    setSubmitting(true);

    try {
      const url = profile ? "update" : "activate";
      const formData = new FormData();

      // Append fields
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
        showToast(data.message || "Profile saved successfully", 'success');
        setProfile(data.profile);
        setForm((prev) => ({ ...prev, profile_image: null, id_card_image: null }));
      } else {
        showToast(data.message || "Error saving profile", 'error');
      }
    } catch (err) {
      console.error(err);
      showToast("Network error. Please try again.", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Loading Profile</h3>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-gray-300">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Delivery Profile Setup</h1>
            <p className="text-gray-700">
              {profile 
                ? "Update your delivery information and settings" 
                : "Complete your profile to start accepting delivery requests"}
            </p>
          </div>
        </div>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Vehicle Information */}
            <div className="border border-gray-300 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Truck className="w-6 h-6 text-gray-900" />
                <h2 className="text-xl font-bold text-gray-900">Vehicle Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Vehicle Type *
                  </label>
                  <div className="relative">
                    <select
                      value={form.vehicle_type}
                      onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white appearance-none"
                      required
                    >
                      <option value="">Select Vehicle Type</option>
                      <option value="Motorcycle">Motorcycle</option>
                      <option value="Car">Car</option>
                      <option value="Bicycle">Bicycle</option>
                      <option value="Truck">Truck</option>
                      <option value="Van">Van</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                      <Truck className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Plate Number
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="ABC-123"
                      value={form.plate_number}
                      onChange={(e) => setForm({ ...form, plate_number: e.target.value })}
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    License Number
                  </label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="DL-123456"
                      value={form.license_number}
                      onChange={(e) => setForm({ ...form, license_number: e.target.value })}
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    National ID *
                  </label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="16-digit National ID"
                      maxLength={16}
                      value={form.national_id}
                      onChange={(e) => setForm({ ...form, national_id: e.target.value.replace(/\D/g, "") })}
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-600">Must be exactly 16 digits</p>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="border border-gray-300 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-6 h-6 text-gray-900" />
                <h2 className="text-xl font-bold text-gray-900">Location Information</h2>
              </div>

              {geoError && (
                <div className="mb-6 p-4 bg-gray-100 border border-gray-300 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-900">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">{geoError}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Subcity *
                  </label>
                  <div className="relative">
                    <select
                      value={form.subcity_id}
                      onChange={(e) => setForm({ ...form, subcity_id: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white appearance-none"
                      required
                    >
                      <option value="">Select Subcity</option>
                      {subCities.map((sc) => (
                        <option key={sc.id} value={sc.id}>
                          {sc.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                      <Building className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    City *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter city"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Region *
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter region"
                      value={form.region}
                      onChange={(e) => setForm({ ...form, region: e.target.value })}
                      className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Coordinates
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Latitude"
                        value={form.latitude}
                        readOnly
                        className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>
                    <div className="relative">
                      <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Longitude"
                        value={form.longitude}
                        readOnly
                        className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-600">
                    <Navigation className="w-3 h-3 inline mr-1" />
                    Automatically detected from your device
                  </p>
                </div>
              </div>
            </div>

            {/* Document Upload */}
            <div className="border border-gray-300 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Upload className="w-6 h-6 text-gray-900" />
                <h2 className="text-xl font-bold text-gray-900">Document Upload</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-4">
                    Profile Image
                  </label>
                  <div className="space-y-4">
                    {preview.profile_image ? (
                      <div className="relative">
                        <div className="w-full aspect-square rounded-lg border-2 border-gray-300 overflow-hidden">
                          <img
                            src={preview.profile_image}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage("profile_image")}
                          className="absolute top-2 right-2 p-1 bg-white border border-gray-300 rounded-full hover:bg-gray-50"
                        >
                          <XCircle className="w-5 h-5 text-gray-700" />
                        </button>
                      </div>
                    ) : (
                      <label className="block cursor-pointer">
                        <div className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-900 transition-colors">
                          <Camera className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm font-medium text-gray-700">Upload Profile Image</span>
                          <span className="text-xs text-gray-500 mt-1">JPG, PNG, max 5MB</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "profile_image")}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* ID Card Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-4">
                    ID Card Image
                  </label>
                  <div className="space-y-4">
                    {preview.id_card_image ? (
                      <div className="relative">
                        <div className="w-full aspect-square rounded-lg border-2 border-gray-300 overflow-hidden">
                          <img
                            src={preview.id_card_image}
                            alt="ID card preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage("id_card_image")}
                          className="absolute top-2 right-2 p-1 bg-white border border-gray-300 rounded-full hover:bg-gray-50"
                        >
                          <XCircle className="w-5 h-5 text-gray-700" />
                        </button>
                      </div>
                    ) : (
                      <label className="block cursor-pointer">
                        <div className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-900 transition-colors">
                          <IdCard className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm font-medium text-gray-700">Upload ID Card</span>
                          <span className="text-xs text-gray-500 mt-1">JPG, PNG, max 5MB</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "id_card_image")}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-gray-300 pt-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    {profile 
                      ? "Update your delivery profile information" 
                      : "By submitting, you agree to our delivery terms and conditions"}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 border border-gray-900"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : profile ? (
                    "Update Profile"
                  ) : (
                    "Activate Delivery Profile"
                  )}
                </button>
              </div>
            </div>
          </form>
        </main>
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
        
        /* Remove default arrow from select */
        select {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
        
        select::-ms-expand {
          display: none;
        }
      `}</style>
    </>
  );
}