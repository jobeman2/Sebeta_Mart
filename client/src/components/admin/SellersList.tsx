"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Users,
  Home,
  DollarSign,
  RefreshCw,
  Ban,
  Check,
  X,
  Shield,
  MapPin,
  FileText,
  Building,
  Tag,
  Clock,
  User,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Globe,
  File,
  CheckSquare,
  Square,
  Trash2,
  Send,
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

// Update interface to match your backend response
interface Seller {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  is_verified: boolean;
  shop_name?: string;
  shop_description?: string;
  shop_address?: string;
  business_license?: string;
  government_id?: string;
  national_id_number?: string;
  registration_date?: string;
  last_login?: string;
  activeListings?: number;
  totalTransactions?: number;
  totalRevenue?: number;
}

interface SellersListProps {
  isCityClerk?: boolean;
}

const StatusBadge = ({ isVerified }: { isVerified: boolean }) => {
  if (isVerified) {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 border border-gray-300">
        <CheckCircle className="w-3 h-3" />
        <span>Verified</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 border border-gray-300">
      <AlertCircle className="w-3 h-3" />
      <span>Pending</span>
    </div>
  );
};

export function SellersList({ isCityClerk = false }: SellersListProps) {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const itemsPerPage = 8;

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  };

  // Fetch sellers from backend
  const fetchSellers = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("http://localhost:5000/admin/sellers", {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Authentication required. Please log in again.");
        }
        if (res.status === 403) {
          throw new Error("You don't have permission to view sellers");
        }
        if (res.status === 404) {
          throw new Error("Sellers endpoint not found. Check server routes.");
        }
        throw new Error(`Failed to fetch sellers: ${res.status}`);
      }

      const data = await res.json();
      console.log("Sellers data:", data);
      setSellers(data.sellers || data || []);
    } catch (err: any) {
      console.error("Error fetching sellers:", err);
      setError(err.message || "Failed to load sellers");
    } finally {
      setLoading(false);
    }
  };

  // Fetch single seller details for sidebar
  const fetchSellerDetails = async (sellerId: number) => {
    try {
      setActionLoading(true);
      const res = await fetch(
        `http://localhost:5000/admin/sellers/${sellerId}`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch seller details: ${res.status}`);
      }

      const sellerData = await res.json();
      setSelectedSeller(sellerData);
      setIsSidebarOpen(true);
    } catch (err: any) {
      console.error("Error fetching seller details:", err);
      showToast(err.message || "Failed to load seller details", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle seller verification
  const handleVerifySeller = async (sellerId: number, verify: boolean) => {
    if (isCityClerk) {
      showToast(
        "City clerks cannot modify seller verification status",
        "error"
      );
      return;
    }

    try {
      setVerifyingId(sellerId);

      const res = await fetch(
        `http://localhost:5000/admin/sellers/${sellerId}/verify`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ verify }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.msg || `Failed to update: ${res.status}`);
      }

      const data = await res.json();

      // Update local state
      setSellers((prev) =>
        prev.map((seller) =>
          seller.id === sellerId ? { ...seller, is_verified: verify } : seller
        )
      );

      // Update selected seller if open
      if (selectedSeller && selectedSeller.id === sellerId) {
        setSelectedSeller({ ...selectedSeller, is_verified: verify });
      }

      showToast(
        data.msg || `Seller ${verify ? "verified" : "unverified"} successfully`,
        "success"
      );
    } catch (err: any) {
      console.error("Error updating seller:", err);
      showToast(err.message || "Failed to update seller", "error");
    } finally {
      setVerifyingId(null);
    }
  };

  // Handle bulk verification
  const handleBulkVerify = async (verify: boolean, sellerIds: number[]) => {
    if (isCityClerk) {
      showToast(
        "City clerks cannot modify seller verification status",
        "error"
      );
      return;
    }

    if (sellerIds.length === 0) {
      showToast("No sellers selected", "info");
      return;
    }

    try {
      setActionLoading(true);

      // Process each seller sequentially
      let successCount = 0;
      let errorCount = 0;

      for (const sellerId of sellerIds) {
        try {
          await handleVerifySeller(sellerId, verify);
          successCount++;
        } catch {
          errorCount++;
        }
      }

      if (errorCount > 0) {
        showToast(
          `${successCount} sellers updated, ${errorCount} failed`,
          successCount > 0 ? "success" : "error"
        );
      } else {
        showToast(
          `Successfully ${
            verify ? "verified" : "unverified"
          } ${successCount} sellers`,
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
    setSelectedSeller(null);
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  // Filter sellers
  const filteredSellers = sellers.filter((seller) => {
    const matchesSearch =
      seller.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.phone_number?.includes(searchTerm) ||
      seller.shop_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "verified" && seller.is_verified) ||
      (statusFilter === "pending" && !seller.is_verified);

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredSellers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSellers = filteredSellers.slice(
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

  // Loading state
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading sellers...</p>
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
            Error Loading Sellers
          </h3>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchSellers}
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
  if (sellers.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <Users className="w-16 h-16 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-900">
            No Sellers Found
          </h3>
          <p className="text-gray-600">No sellers have registered yet.</p>
          <button
            onClick={fetchSellers}
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
                Sellers Management
              </h2>
              <p className="text-gray-600 mt-2">
                {isCityClerk
                  ? "View-only access to seller information"
                  : "Manage all seller accounts and verifications"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchSellers}
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
                      handleBulkVerify(
                        true,
                        currentSellers.map((s) => s.id)
                      )
                    }
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span className="font-medium">Bulk Verify</span>
                  </button>
                  <button
                    onClick={() =>
                      handleBulkVerify(
                        false,
                        currentSellers.map((s) => s.id)
                      )
                    }
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <Ban className="w-4 h-4" />
                    <span className="font-medium">Bulk Unverify</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sellers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {sellers.length}
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
                  <p className="text-sm text-gray-600">Verified</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {sellers.filter((s) => s.is_verified).length}
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
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {sellers.filter((s) => !s.is_verified).length}
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
                  <p className="text-sm text-gray-600">Total Shops</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {sellers.filter((s) => s.shop_name).length}
                  </p>
                </div>
                <div className="p-2 bg-white rounded-lg border border-gray-200">
                  <Building className="w-5 h-5 text-gray-700" />
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
                  placeholder="Search by name, email, phone, or shop..."
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
                All
              </button>
              <button
                onClick={() => setStatusFilter("verified")}
                className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                  statusFilter === "verified"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Verified
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
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left p-6 font-semibold text-gray-900 text-sm">
                  Seller Information
                </th>
                <th className="text-left p-6 font-semibold text-gray-900 text-sm">
                  Contact Details
                </th>
                <th className="text-left p-6 font-semibold text-gray-900 text-sm">
                  Shop Info
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
              {currentSellers.map((seller) => (
                <tr
                  key={seller.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {seller.full_name?.[0]?.toUpperCase() || "S"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {seller.full_name || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          ID: {seller.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-3 h-3" />
                        <span>{seller.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3 h-3" />
                        <span>{seller.phone_number || "N/A"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900">
                        {seller.shop_name || "No shop"}
                      </p>
                      {seller.shop_address && (
                        <p className="text-sm text-gray-600 truncate max-w-xs">
                          {seller.shop_address}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-6">
                    <StatusBadge isVerified={seller.is_verified} />
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fetchSellerDetails(seller.id)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {!isCityClerk && (
                        <>
                          {seller.is_verified ? (
                            <button
                              onClick={() =>
                                handleVerifySeller(seller.id, false)
                              }
                              disabled={
                                verifyingId === seller.id || actionLoading
                              }
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 disabled:opacity-50"
                              title="Unverify Seller"
                            >
                              {verifyingId === seller.id ? (
                                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Ban className="w-4 h-4" />
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleVerifySeller(seller.id, true)
                              }
                              disabled={
                                verifyingId === seller.id || actionLoading
                              }
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 disabled:opacity-50"
                              title="Verify Seller"
                            >
                              {verifyingId === seller.id ? (
                                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </>
                      )}

                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredSellers.length > itemsPerPage && (
          <div className="p-6 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + itemsPerPage, filteredSellers.length)} of{" "}
              {filteredSellers.length} sellers
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

      {/* Seller Details Sidebar */}
      {isSidebarOpen && selectedSeller && (
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
                  Seller Details
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  ID: {selectedSeller.id}
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
              {actionLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                    <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl font-bold">
                        {selectedSeller.full_name?.[0]?.toUpperCase() || "S"}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">
                        {selectedSeller.full_name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge isVerified={selectedSeller.is_verified} />
                        <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                          User ID: {selectedSeller.user_id}
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
                          <p className="font-medium">{selectedSeller.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <PhoneIcon className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium">
                            {selectedSeller.phone_number || "N/A"}
                          </p>
                        </div>
                      </div>
                      {selectedSeller.national_id_number && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Shield className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">National ID</p>
                            <p className="font-medium">
                              {selectedSeller.national_id_number}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shop Information */}
                  {selectedSeller.shop_name && (
                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Shop Information
                      </h5>
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Shop Name</p>
                          <p className="font-medium">
                            {selectedSeller.shop_name}
                          </p>
                        </div>
                        {selectedSeller.shop_address && (
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                            <div>
                              <p className="text-sm text-gray-600">Address</p>
                              <p className="font-medium">
                                {selectedSeller.shop_address}
                              </p>
                            </div>
                          </div>
                        )}
                        {selectedSeller.shop_description && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Description</p>
                            <p className="font-medium mt-1">
                              {selectedSeller.shop_description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  {!isCityClerk &&
                    (selectedSeller.business_license ||
                      selectedSeller.government_id) && (
                      <div className="space-y-4">
                        <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Documents
                        </h5>
                        <div className="space-y-2">
                          {selectedSeller.business_license && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm text-gray-600">
                                Business License
                              </span>
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                                {selectedSeller.business_license}
                              </span>
                            </div>
                          )}
                          {selectedSeller.government_id && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm text-gray-600">
                                Government ID
                              </span>
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                                {selectedSeller.government_id}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Verification Actions */}
                  {!isCityClerk && (
                    <div className="pt-6 border-t border-gray-200">
                      <h5 className="font-semibold text-gray-900 mb-4">
                        Verification Actions
                      </h5>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedSeller.is_verified ? (
                          <button
                            onClick={() =>
                              handleVerifySeller(selectedSeller.id, false)
                            }
                            disabled={
                              verifyingId === selectedSeller.id || actionLoading
                            }
                            className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            {verifyingId === selectedSeller.id ? (
                              <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Ban className="w-4 h-4" />
                            )}
                            <span className="font-medium">Unverify</span>
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleVerifySeller(selectedSeller.id, true)
                            }
                            disabled={
                              verifyingId === selectedSeller.id || actionLoading
                            }
                            className="flex items-center justify-center gap-2 p-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                          >
                            {verifyingId === selectedSeller.id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            <span className="font-medium">Verify</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const emailUrl = `mailto:${selectedSeller.email}?subject=Account Verification&body=Dear ${selectedSeller.full_name},%0A%0AYour account has been reviewed.`;
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
              )}
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
