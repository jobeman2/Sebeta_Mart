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
  CreditCard,
  ShoppingBag,
  TrendingUp,
  MessageSquare,
  Send,
  Trash2,
  Lock,
  Unlock,
  Activity,
  Award,
  Building,
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
interface Buyer {
  id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  // Additional fields that might be available
  status?: "active" | "inactive";
  registration_date?: string;
  last_login?: string;
  completed_purchases?: number;
  total_spent?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

interface BuyersProps {
  isCityClerk?: boolean;
}

const StatusBadge = ({ isActive = true }: { isActive?: boolean }) => {
  if (isActive) {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 border border-gray-300">
        <CheckCircle className="w-3 h-3" />
        <span>Active</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 border border-gray-300">
      <XCircle className="w-3 h-3" />
      <span>Inactive</span>
    </div>
  );
};

export function Buyers({ isCityClerk = false }: BuyersProps) {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const itemsPerPage = 10;

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  };

  // Fetch buyers from backend
  const fetchBuyers = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("http://localhost:5000/admin/buyers", {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Authentication required. Please log in again.");
        }
        if (res.status === 403) {
          throw new Error("You don't have permission to view buyers");
        }
        if (res.status === 404) {
          throw new Error("Buyers endpoint not found. Check server routes.");
        }
        throw new Error(`Failed to fetch buyers: ${res.status}`);
      }

      const data = await res.json();
      console.log("Buyers API Response:", data);

      // Handle response format - could be { buyers: [] } or just []
      const buyersData = data.buyers || data || [];
      setBuyers(buyersData);
    } catch (err: any) {
      console.error("Error fetching buyers:", err);
      setError(err.message || "Failed to load buyers");
    } finally {
      setLoading(false);
    }
  };

  // View buyer details (simulated since you don't have detail endpoint yet)
  const handleViewBuyer = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setIsSidebarOpen(true);
  };

  // Simulate status change (you'll need to implement backend endpoint)
  const handleStatusChange = async (buyerId: number, isActive: boolean) => {
    if (isCityClerk) {
      showToast("City clerks cannot modify buyer status", "error");
      return;
    }

    try {
      setActionLoading(true);

      // Simulate API call - you'll need to implement this endpoint
      // const res = await fetch(`http://localhost:5000/admin/buyers/${buyerId}/status`, {
      //   method: "PATCH",
      //   headers: { "Content-Type": "application/json" },
      //   credentials: "include",
      //   body: JSON.stringify({ is_active: isActive }),
      // });

      // Simulate success for now
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update local state
      setBuyers((prev) =>
        prev.map((buyer) =>
          buyer.id === buyerId
            ? { ...buyer, status: isActive ? "active" : "inactive" }
            : buyer
        )
      );

      // Update selected buyer if open
      if (selectedBuyer && selectedBuyer.id === buyerId) {
        setSelectedBuyer({
          ...selectedBuyer,
          status: isActive ? "active" : "inactive",
        });
      }

      showToast(
        `Buyer ${isActive ? "activated" : "deactivated"} successfully`,
        "success"
      );
    } catch (err: any) {
      console.error("Error updating buyer:", err);
      showToast(err.message || "Failed to update buyer", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Simulate bulk status change
  const handleBulkStatusChange = async (
    isActive: boolean,
    buyerIds: number[]
  ) => {
    if (isCityClerk) {
      showToast("City clerks cannot modify buyer status", "error");
      return;
    }

    if (buyerIds.length === 0) {
      showToast("No buyers selected", "info");
      return;
    }

    try {
      setActionLoading(true);

      // Process each buyer
      let successCount = 0;
      let errorCount = 0;

      for (const buyerId of buyerIds) {
        try {
          await handleStatusChange(buyerId, isActive);
          successCount++;
        } catch {
          errorCount++;
        }
      }

      if (errorCount > 0) {
        showToast(
          `${successCount} buyers updated, ${errorCount} failed`,
          successCount > 0 ? "success" : "error"
        );
      } else {
        showToast(
          `Successfully ${
            isActive ? "activated" : "deactivated"
          } ${successCount} buyers`,
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

  // Close sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedBuyer(null);
  };

  useEffect(() => {
    fetchBuyers();
  }, []);

  // Filter buyers
  const filteredBuyers = buyers.filter((buyer) => {
    const matchesSearch =
      buyer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.phone_number?.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && buyer.status !== "inactive") ||
      (statusFilter === "inactive" && buyer.status === "inactive");

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredBuyers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBuyers = filteredBuyers.slice(
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

  const formatCurrency = (amount?: number) => {
    if (!amount) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate stats
  const totalBuyers = buyers.length;
  const activeBuyers = buyers.filter((b) => b.status !== "inactive").length;
  const inactiveBuyers = buyers.filter((b) => b.status === "inactive").length;

  // Loading state
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading buyers...</p>
          <p className="text-sm text-gray-500">
            Fetching from: http://localhost:5000/admin/buyers
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
            Error Loading Buyers
          </h3>
          <p className="text-gray-600">{error}</p>
          <div className="text-sm text-gray-500 mb-4">
            Endpoint: http://localhost:5000/admin/buyers
          </div>
          <button
            onClick={fetchBuyers}
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
  if (buyers.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <Users className="w-16 h-16 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-900">
            No Buyers Found
          </h3>
          <p className="text-gray-600">No buyers have registered yet.</p>
          <button
            onClick={fetchBuyers}
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
                Buyers Management
              </h2>
              <p className="text-gray-600 mt-2">
                {isCityClerk
                  ? "View-only access to buyer information"
                  : "Manage all buyer accounts"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchBuyers}
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
                        true,
                        currentBuyers.map((b) => b.id)
                      )
                    }
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Bulk Activate</span>
                  </button>
                  <button
                    onClick={() =>
                      handleBulkStatusChange(
                        false,
                        currentBuyers.map((b) => b.id)
                      )
                    }
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span className="font-medium">Bulk Deactivate</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Buyers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {totalBuyers}
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
                  <p className="text-sm text-gray-600">Active Buyers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {activeBuyers}
                  </p>
                </div>
                <div className="p-2 bg-white rounded-lg border border-gray-200">
                  <Activity className="w-5 h-5 text-gray-700" />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inactive Buyers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {inactiveBuyers}
                  </p>
                </div>
                <div className="p-2 bg-white rounded-lg border border-gray-200">
                  <AlertCircle className="w-5 h-5 text-gray-700" />
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
                  placeholder="Search by name, email, or phone..."
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
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                  statusFilter === "all"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                All ({buyers.length})
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                  statusFilter === "active"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Active ({activeBuyers})
              </button>
              <button
                onClick={() => setStatusFilter("inactive")}
                className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                  statusFilter === "inactive"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Inactive ({inactiveBuyers})
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
                  Buyer Information
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
              {currentBuyers.map((buyer) => (
                <tr
                  key={buyer.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {buyer.full_name?.[0]?.toUpperCase() || "B"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {buyer.full_name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          ID: {buyer.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-3 h-3" />
                        <span>{buyer.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3 h-3" />
                        <span>{buyer.phone_number || "Not provided"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <StatusBadge isActive={buyer.status !== "inactive"} />
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewBuyer(buyer)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {!isCityClerk && (
                        <>
                          {buyer.status !== "inactive" ? (
                            <button
                              onClick={() =>
                                handleStatusChange(buyer.id, false)
                              }
                              disabled={actionLoading}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 disabled:opacity-50"
                              title="Deactivate Buyer"
                            >
                              <Lock className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(buyer.id, true)}
                              disabled={actionLoading}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 disabled:opacity-50"
                              title="Activate Buyer"
                            >
                              <Unlock className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}

                      <button
                        onClick={() => {
                          const emailUrl = `mailto:${buyer.email}?subject=Account Update&body=Dear ${buyer.full_name},%0A%0A`;
                          window.open(emailUrl, "_blank");
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                        title="Email Buyer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredBuyers.length > itemsPerPage && (
          <div className="p-6 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + itemsPerPage, filteredBuyers.length)} of{" "}
              {filteredBuyers.length} buyers
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

      {/* Buyer Details Sidebar */}
      {isSidebarOpen && selectedBuyer && (
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
                  Buyer Details
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  ID: {selectedBuyer.id}
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
                  <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      {selectedBuyer.full_name?.[0]?.toUpperCase() || "B"}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">
                      {selectedBuyer.full_name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge
                        isActive={selectedBuyer.status !== "inactive"}
                      />
                      <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                        Buyer ID: {selectedBuyer.id}
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
                        <p className="font-medium">{selectedBuyer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <PhoneIcon className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">
                          {selectedBuyer.phone_number || "Not provided"}
                        </p>
                      </div>
                    </div>
                    {selectedBuyer.address && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Address</p>
                          <p className="font-medium">{selectedBuyer.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Information (if available) */}
                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Additional Information
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedBuyer.registration_date && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600">Registered</p>
                        <p className="font-medium text-gray-900 mt-1">
                          {formatDate(selectedBuyer.registration_date)}
                        </p>
                      </div>
                    )}
                    {selectedBuyer.last_login && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600">Last Login</p>
                        <p className="font-medium text-gray-900 mt-1">
                          {formatDate(selectedBuyer.last_login)}
                        </p>
                      </div>
                    )}
                    {selectedBuyer.completed_purchases !== undefined && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600">Total Purchases</p>
                        <p className="font-medium text-gray-900 mt-1">
                          {selectedBuyer.completed_purchases}
                        </p>
                      </div>
                    )}
                    {selectedBuyer.total_spent !== undefined && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600">Total Spent</p>
                        <p className="font-medium text-gray-900 mt-1">
                          {formatCurrency(selectedBuyer.total_spent)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Actions */}
                {!isCityClerk && (
                  <div className="pt-6 border-t border-gray-200">
                    <h5 className="font-semibold text-gray-900 mb-4">
                      Account Actions
                    </h5>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedBuyer.status !== "inactive" ? (
                        <button
                          onClick={() =>
                            handleStatusChange(selectedBuyer.id, false)
                          }
                          disabled={actionLoading}
                          className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          <Lock className="w-4 h-4" />
                          <span className="font-medium">Deactivate</span>
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleStatusChange(selectedBuyer.id, true)
                          }
                          disabled={actionLoading}
                          className="flex items-center justify-center gap-2 p-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                          <Unlock className="w-4 h-4" />
                          <span className="font-medium">Activate</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const emailUrl = `mailto:${selectedBuyer.email}?subject=Account Update&body=Dear ${selectedBuyer.full_name},%0A%0A`;
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
