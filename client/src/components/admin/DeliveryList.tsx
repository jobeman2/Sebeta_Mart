"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Users,
  RefreshCw,
  X,
  User,
  Phone as PhoneIcon,
  Mail as MailIcon,
  MapPin,
  FileText,
  Shield,
  Clock,
  Car,
  Truck,
  Package,
  Bike,
  Award,
  Send,
  Trash2,
  Lock,
  Unlock,
  Activity,
  File,
  Image as ImageIcon,
  CheckSquare,
  Ban,
  Check,
} from "lucide-react";

// Toast component
const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: "bg-white border border-gray-300 shadow-lg",
    error: "bg-white border border-gray-300 shadow-lg",
    info: "bg-white border border-gray-300 shadow-lg",
  };

  const textColor = {
    success: "text-gray-900",
    error: "text-gray-900",
    info: "text-gray-900",
  };

  const icon = {
    success: <CheckCircle className="w-5 h-5 text-gray-700" />,
    error: <XCircle className="w-5 h-5 text-gray-700" />,
    info: <AlertCircle className="w-5 h-5 text-gray-700" />,
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg ${bgColor[type]} ${textColor[type]} flex items-center gap-3 animate-slideIn`}
    >
      {icon[type]}
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-gray-500 hover:text-gray-700"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Interface matching your API response
interface DeliveryProfile {
  id: number;
  user_id: number;
  vehicle_type: string;
  plate_number: string;
  license_number: string;
  profile_image: string;
  national_id: string;
  id_card_image: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  full_name: string;
  email: string;
  phone_number: string;
  // Additional fields that might be available
  registration_date?: string;
  last_login?: string;
  completed_deliveries?: number;
  rating?: number;
  address?: string;
}

interface DeliveryProps {
  isCityClerk?: boolean;
}

const StatusBadge = ({ status }: { status: DeliveryProfile["status"] }) => {
  const styles = {
    pending: "bg-gray-100 text-gray-800 border-gray-300",
    approved: "bg-gray-100 text-gray-800 border-gray-300",
    rejected: "bg-gray-100 text-gray-800 border-gray-300",
    suspended: "bg-gray-100 text-gray-800 border-gray-300",
  };

  const icons = {
    pending: <AlertCircle className="w-3 h-3" />,
    approved: <CheckCircle className="w-3 h-3" />,
    rejected: <XCircle className="w-3 h-3" />,
    suspended: <Ban className="w-3 h-3" />,
  };

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${styles[status]}`}
    >
      {icons[status]}
      <span className="capitalize">{status}</span>
    </div>
  );
};

const VehicleIcon = ({ type }: { type: string }) => {
  const icons: Record<string, React.ReactNode> = {
    motor: <Bike className="w-4 h-4 text-gray-600" />,
    car: <Car className="w-4 h-4 text-gray-600" />,
    truck: <Truck className="w-4 h-4 text-gray-600" />,
    bike: <Bike className="w-4 h-4 text-gray-600" />,
  };

  return (
    <div className="flex items-center gap-1">
      {icons[type.toLowerCase()] || <Car className="w-4 h-4 text-gray-600" />}
      <span className="text-sm font-medium capitalize">{type}</span>
    </div>
  );
};

export function DeliveryList({ isCityClerk = false }: DeliveryProps) {
  const [deliveryProfiles, setDeliveryProfiles] = useState<DeliveryProfile[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [vehicleFilter, setVehicleFilter] = useState<string>("all");
  const [selectedProfile, setSelectedProfile] =
    useState<DeliveryProfile | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  const itemsPerPage = 10;

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  };

  // Fetch delivery profiles from backend - FIXED TO HANDLE DIFFERENT RESPONSE FORMATS
  const fetchDeliveryProfiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("http://localhost:5000/admin/delivery_profiles", {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Authentication required. Please log in again.");
        }
        if (res.status === 403) {
          throw new Error(
            "You don't have permission to view delivery profiles"
          );
        }
        if (res.status === 404) {
          throw new Error(
            "Delivery profiles endpoint not found. Check server routes."
          );
        }
        throw new Error(`Failed to fetch delivery profiles: ${res.status}`);
      }

      const data = await res.json();
      console.log("Delivery Profiles API Response:", data);

      // Handle different response formats
      let profilesData: DeliveryProfile[] = [];

      if (Array.isArray(data)) {
        // Response is directly an array
        profilesData = data;
      } else if (data && typeof data === "object") {
        // Response is an object, check for common keys
        if (Array.isArray(data.profiles)) {
          profilesData = data.profiles;
        } else if (Array.isArray(data.delivery_profiles)) {
          profilesData = data.delivery_profiles;
        } else if (Array.isArray(data.data)) {
          profilesData = data.data;
        } else if (Array.isArray(data.results)) {
          profilesData = data.results;
        } else {
          // Try to extract values if it's an object with numeric keys
          const values = Object.values(data);
          if (Array.isArray(values) && values.length > 0) {
            profilesData = values as DeliveryProfile[];
          }
        }
      }

      console.log("Processed profiles data:", profilesData);

      // Ensure it's an array
      if (!Array.isArray(profilesData)) {
        console.error("Profiles data is not an array:", profilesData);
        profilesData = [];
      }

      setDeliveryProfiles(profilesData);
    } catch (err: any) {
      console.error("Error fetching delivery profiles:", err);
      setError(err.message || "Failed to load delivery profiles");
    } finally {
      setLoading(false);
    }
  };

  // Handle delivery profile verification/status change
  const handleStatusChange = async (
    profileId: number,
    status: DeliveryProfile["status"]
  ) => {
    if (isCityClerk) {
      showToast("City clerks cannot modify delivery profile status", "error");
      return;
    }

    try {
      setVerifyingId(profileId);

      // You'll need to implement this endpoint
      const res = await fetch(
        `http://localhost:5000/admin/delivery_profiles/${profileId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.msg || `Failed to update: ${res.status}`);
      }

      const data = await res.json();

      // Update local state
      setDeliveryProfiles((prev) =>
        prev.map((profile) =>
          profile.id === profileId ? { ...profile, status } : profile
        )
      );

      // Update selected profile if open
      if (selectedProfile && selectedProfile.id === profileId) {
        setSelectedProfile({ ...selectedProfile, status });
      }

      showToast(
        data.msg || `Delivery profile ${status} successfully`,
        "success"
      );
    } catch (err: any) {
      console.error("Error updating delivery profile:", err);
      showToast(err.message || "Failed to update delivery profile", "error");
    } finally {
      setVerifyingId(null);
    }
  };

  // Handle bulk status change
  const handleBulkStatusChange = async (
    status: DeliveryProfile["status"],
    profileIds: number[]
  ) => {
    if (isCityClerk) {
      showToast("City clerks cannot modify delivery profile status", "error");
      return;
    }

    if (profileIds.length === 0) {
      showToast("No delivery profiles selected", "info");
      return;
    }

    try {
      setActionLoading(true);

      // Process each profile sequentially
      let successCount = 0;
      let errorCount = 0;

      for (const profileId of profileIds) {
        try {
          await handleStatusChange(profileId, status);
          successCount++;
        } catch {
          errorCount++;
        }
      }

      if (errorCount > 0) {
        showToast(
          `${successCount} profiles updated, ${errorCount} failed`,
          successCount > 0 ? "success" : "error"
        );
      } else {
        showToast(
          `Successfully updated ${successCount} delivery profiles to ${status}`,
          "success"
        );
      }
    } catch (err: any) {
      console.error("Error in bulk operation:", err);
      showToast(err.message || "Bulk operation failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // View delivery profile details
  const handleViewProfile = (profile: DeliveryProfile) => {
    setSelectedProfile(profile);
    setIsSidebarOpen(true);
  };

  // Close sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedProfile(null);
  };

  useEffect(() => {
    fetchDeliveryProfiles();
  }, []);

  // Filter delivery profiles - ADDED SAFETY CHECK
  const filteredProfiles = Array.isArray(deliveryProfiles)
    ? deliveryProfiles.filter((profile) => {
        const matchesSearch =
          profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          profile.phone_number?.includes(searchTerm) ||
          profile.plate_number
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          profile.license_number?.includes(searchTerm);

        const matchesStatus =
          statusFilter === "all" || profile.status === statusFilter;

        const matchesVehicle =
          vehicleFilter === "all" || profile.vehicle_type === vehicleFilter;

        return matchesSearch && matchesStatus && matchesVehicle;
      })
    : [];

  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProfiles = filteredProfiles.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate stats - ADDED SAFETY CHECK
  const totalProfiles = Array.isArray(deliveryProfiles)
    ? deliveryProfiles.length
    : 0;
  const pendingProfiles = Array.isArray(deliveryProfiles)
    ? deliveryProfiles.filter((p) => p.status === "pending").length
    : 0;
  const approvedProfiles = Array.isArray(deliveryProfiles)
    ? deliveryProfiles.filter((p) => p.status === "approved").length
    : 0;
  const rejectedProfiles = Array.isArray(deliveryProfiles)
    ? deliveryProfiles.filter((p) => p.status === "rejected").length
    : 0;
  const suspendedProfiles = Array.isArray(deliveryProfiles)
    ? deliveryProfiles.filter((p) => p.status === "suspended").length
    : 0;

  // Get unique vehicle types - ADDED SAFETY CHECK
  const vehicleTypes = Array.isArray(deliveryProfiles)
    ? [...new Set(deliveryProfiles.map((p) => p.vehicle_type))]
    : [];

  // Loading state
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading delivery profiles...</p>
          <p className="text-sm text-gray-500">
            Fetching from: http://localhost:5000/admin/delivery_profiles
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Error Loading Delivery Profiles
          </h3>
          <p className="text-gray-600">{error}</p>
          <div className="text-sm text-gray-500 mb-4">
            Endpoint: http://localhost:5000/admin/delivery_profiles
          </div>
          <button
            onClick={fetchDeliveryProfiles}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!Array.isArray(deliveryProfiles) || deliveryProfiles.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <Package className="w-16 h-16 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-900">
            No Delivery Profiles Found
          </h3>
          <p className="text-gray-600">
            No delivery profiles have registered yet.
          </p>
          <button
            onClick={fetchDeliveryProfiles}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Main Content */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Delivery Profiles
              </h2>
              <p className="text-gray-600 mt-2">
                {isCityClerk
                  ? "View-only access to delivery profiles"
                  : "Manage all delivery driver profiles and verifications"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchDeliveryProfiles}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="font-medium">Refresh</span>
              </button>
              {!isCityClerk && (
                <>
                  <button
                    onClick={() =>
                      handleBulkStatusChange(
                        "approved",
                        currentProfiles.map((p) => p.id)
                      )
                    }
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Bulk Approve</span>
                  </button>
                  <button
                    onClick={() =>
                      handleBulkStatusChange(
                        "rejected",
                        currentProfiles.map((p) => p.id)
                      )
                    }
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span className="font-medium">Bulk Reject</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Profiles</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {totalProfiles}
                  </p>
                </div>
                <div className="p-2 bg-white rounded-lg border border-gray-200">
                  <Users className="w-5 h-5 text-gray-700" />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {pendingProfiles}
                  </p>
                </div>
                <div className="p-2 bg-white rounded-lg border border-gray-200">
                  <AlertCircle className="w-5 h-5 text-gray-700" />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {approvedProfiles}
                  </p>
                </div>
                <div className="p-2 bg-white rounded-lg border border-gray-200">
                  <CheckCircle className="w-5 h-5 text-gray-700" />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {rejectedProfiles}
                  </p>
                </div>
                <div className="p-2 bg-white rounded-lg border border-gray-200">
                  <XCircle className="w-5 h-5 text-gray-700" />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Suspended</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {suspendedProfiles}
                  </p>
                </div>
                <div className="p-2 bg-white rounded-lg border border-gray-200">
                  <Ban className="w-5 h-5 text-gray-700" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900">
                <Search className="w-4 h-4 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, plate, or license..."
                  className="bg-transparent border-none outline-none text-sm flex-1 placeholder-gray-500"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Vehicle Type Filter */}
              <select
                value={vehicleFilter}
                onChange={(e) => {
                  setVehicleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="all">All Vehicles</option>
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>

              {/* Status Filter Buttons */}
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                  statusFilter === "all"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                  statusFilter === "pending"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setStatusFilter("approved")}
                className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                  statusFilter === "approved"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setStatusFilter("rejected")}
                className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                  statusFilter === "rejected"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Rejected
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left p-6 font-semibold text-gray-900 text-sm">
                  Delivery Profile
                </th>
                <th className="text-left p-6 font-semibold text-gray-900 text-sm">
                  Vehicle Information
                </th>
                <th className="text-left p-6 font-semibold text-gray-900 text-sm">
                  Contact Details
                </th>
                <th className="text-left p-6 font-semibold text-gray-900 text-sm">
                  Status
                </th>
                <th className="text-left p-6 font-semibold text-gray-900 text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentProfiles.map((profile) => (
                <tr
                  key={profile.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {profile.profile_image ? (
                          <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                            <img
                              src={`http://localhost:5000/${profile.profile_image}`}
                              alt={profile.full_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                target.nextElementSibling?.classList.remove(
                                  "hidden"
                                );
                              }}
                            />
                            <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center hidden">
                              <span className="text-white text-sm font-medium">
                                {profile.full_name?.[0]?.toUpperCase() || "D"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {profile.full_name?.[0]?.toUpperCase() || "D"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {profile.full_name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          ID: {profile.id} | User ID: {profile.user_id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="space-y-2">
                      <VehicleIcon type={profile.vehicle_type} />
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Plate:</span>
                          <span>{profile.plate_number}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">License:</span>
                          <span>{profile.license_number}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-3 h-3" />
                        <span>{profile.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3 h-3" />
                        <span>{profile.phone_number}</span>
                      </div>
                      {profile.national_id && (
                        <div className="text-xs text-gray-500">
                          National ID: {profile.national_id}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-6">
                    <StatusBadge status={profile.status} />
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewProfile(profile)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {!isCityClerk && (
                        <>
                          {profile.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusChange(profile.id, "approved")
                                }
                                disabled={
                                  verifyingId === profile.id || actionLoading
                                }
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 disabled:opacity-50"
                                title="Approve"
                              >
                                {verifyingId === profile.id ? (
                                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusChange(profile.id, "rejected")
                                }
                                disabled={
                                  verifyingId === profile.id || actionLoading
                                }
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 disabled:opacity-50"
                                title="Reject"
                              >
                                {verifyingId === profile.id ? (
                                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <X className="w-4 h-4" />
                                )}
                              </button>
                            </>
                          )}
                          {profile.status === "approved" && (
                            <button
                              onClick={() =>
                                handleStatusChange(profile.id, "suspended")
                              }
                              disabled={
                                verifyingId === profile.id || actionLoading
                              }
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 disabled:opacity-50"
                              title="Suspend"
                            >
                              {verifyingId === profile.id ? (
                                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Ban className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          {(profile.status === "rejected" ||
                            profile.status === "suspended") && (
                            <button
                              onClick={() =>
                                handleStatusChange(profile.id, "approved")
                              }
                              disabled={
                                verifyingId === profile.id || actionLoading
                              }
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 disabled:opacity-50"
                              title="Re-approve"
                            >
                              {verifyingId === profile.id ? (
                                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredProfiles.length > itemsPerPage && (
          <div className="p-6 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + itemsPerPage, filteredProfiles.length)} of{" "}
              {filteredProfiles.length} profiles
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium border ${
                      currentPage === pageNum
                        ? "bg-gray-900 text-white border-gray-900"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Profile Details Sidebar */}
      {isSidebarOpen && selectedProfile && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
            onClick={closeSidebar}
          />

          {/* Sidebar */}
          <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-xl z-50 flex flex-col">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Delivery Profile Details
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Profile ID: {selectedProfile.id}
                </p>
              </div>
              <button
                onClick={closeSidebar}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                  <div className="relative">
                    {selectedProfile.profile_image ? (
                      <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden border-2 border-gray-300">
                        <img
                          src={`http://localhost:5000/${selectedProfile.profile_image}`}
                          alt={selectedProfile.full_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.nextElementSibling?.classList.remove(
                              "hidden"
                            );
                          }}
                        />
                        <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center hidden">
                          <span className="text-white text-xl font-bold">
                            {selectedProfile.full_name?.[0]?.toUpperCase() ||
                              "D"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                          {selectedProfile.full_name?.[0]?.toUpperCase() || "D"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">
                      {selectedProfile.full_name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={selectedProfile.status} />
                      <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                        User ID: {selectedProfile.user_id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Contact Information
                  </h5>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <MailIcon className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{selectedProfile.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <PhoneIcon className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">
                          {selectedProfile.phone_number}
                        </p>
                      </div>
                    </div>
                    {selectedProfile.national_id && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Shield className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">National ID</p>
                          <p className="font-medium">
                            {selectedProfile.national_id}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Vehicle Information
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600">Vehicle Type</p>
                      <div className="flex items-center gap-2 mt-1">
                        <VehicleIcon type={selectedProfile.vehicle_type} />
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600">Plate Number</p>
                      <p className="font-medium text-gray-900 mt-1">
                        {selectedProfile.plate_number}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600">License Number</p>
                      <p className="font-medium text-gray-900 mt-1">
                        {selectedProfile.license_number}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600">National ID</p>
                      <p className="font-medium text-gray-900 mt-1">
                        {selectedProfile.national_id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Document Images */}
                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Document Images
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedProfile.profile_image && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 text-center">
                          Profile Photo
                        </p>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={`http://localhost:5000/${selectedProfile.profile_image}`}
                            alt="Profile"
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      </div>
                    )}
                    {selectedProfile.id_card_image && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 text-center">
                          ID Card
                        </p>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={`http://localhost:5000/${selectedProfile.id_card_image}`}
                            alt="ID Card"
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Actions */}
                {!isCityClerk && (
                  <div className="pt-6 border-t border-gray-200">
                    <h5 className="font-semibold text-gray-900 mb-4">
                      Profile Actions
                    </h5>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedProfile.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusChange(selectedProfile.id, "approved")
                            }
                            disabled={
                              verifyingId === selectedProfile.id ||
                              actionLoading
                            }
                            className="flex items-center justify-center gap-2 p-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                          >
                            {verifyingId === selectedProfile.id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            <span className="font-medium">Approve</span>
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(selectedProfile.id, "rejected")
                            }
                            disabled={
                              verifyingId === selectedProfile.id ||
                              actionLoading
                            }
                            className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            {verifyingId === selectedProfile.id ? (
                              <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            <span className="font-medium">Reject</span>
                          </button>
                        </>
                      )}
                      {selectedProfile.status === "approved" && (
                        <button
                          onClick={() =>
                            handleStatusChange(selectedProfile.id, "suspended")
                          }
                          disabled={
                            verifyingId === selectedProfile.id || actionLoading
                          }
                          className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          {verifyingId === selectedProfile.id ? (
                            <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Ban className="w-4 h-4" />
                          )}
                          <span className="font-medium">Suspend</span>
                        </button>
                      )}
                      {(selectedProfile.status === "rejected" ||
                        selectedProfile.status === "suspended") && (
                        <button
                          onClick={() =>
                            handleStatusChange(selectedProfile.id, "approved")
                          }
                          disabled={
                            verifyingId === selectedProfile.id || actionLoading
                          }
                          className="flex items-center justify-center gap-2 p-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                          {verifyingId === selectedProfile.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          <span className="font-medium">Re-approve</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const emailUrl = `mailto:${selectedProfile.email}?subject=Delivery Profile Update&body=Dear ${selectedProfile.full_name},%0A%0A`;
                          window.open(emailUrl, "_blank");
                        }}
                        className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        <span className="font-medium">Email</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add CSS for slide-in animation */}
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
