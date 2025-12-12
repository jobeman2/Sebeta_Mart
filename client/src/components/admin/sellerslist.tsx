"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  User,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Shield,
  Download,
  RefreshCw,
  MoreVertical,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Plus
} from "lucide-react";

interface Seller {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  is_verified: boolean;
  created_at?: string;
  status?: "active" | "pending" | "suspended";
}

export default function SellerList() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "verified" | "unverified">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [verifying, setVerifying] = useState<number | null>(null);
  const itemsPerPage = 10;

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/admin/sellers", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      const sellersData = data.sellers || data; // Handle both formats
      // Add mock status and created_at for demo
      const enhancedData = sellersData.map((seller: Seller) => ({
        ...seller,
        status: seller.is_verified ? "active" : "pending",
        created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0]
      }));
      setSellers(enhancedData);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  // Filter sellers based on search and filter
  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = searchTerm === "" || 
      seller.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.phone_number.includes(searchTerm);
    
    const matchesFilter = filter === "all" || 
      (filter === "verified" && seller.is_verified) ||
      (filter === "unverified" && !seller.is_verified);
    
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSellers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSellers = filteredSellers.slice(startIndex, endIndex);

  const handleVerify = async (sellerId: number) => {
    try {
      setVerifying(sellerId);
      // API call to verify seller - using PATCH method with verify: true in body
      const res = await fetch(`http://localhost:5000/admin/sellers/${sellerId}/verify`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ verify: true })
      });
      
      if (res.ok) {
        // Update local state
        setSellers(sellers.map(seller => 
          seller.id === sellerId ? { ...seller, is_verified: true, status: "active" } : seller
        ));
        
        // Update selected seller if it's the same one
        if (selectedSeller && selectedSeller.id === sellerId) {
          setSelectedSeller(prev => prev ? { ...prev, is_verified: true, status: "active" } : null);
        }
        
        // Show success message
        alert("Seller verified successfully!");
      } else {
        const errorData = await res.json();
        throw new Error(errorData.msg || "Failed to verify seller");
      }
    } catch (err: any) {
      console.error("Failed to verify seller:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setVerifying(null);
    }
  };

  const handleUnverify = async (sellerId: number) => {
    try {
      setVerifying(sellerId);
      // API call to unverify seller - using PATCH method with verify: false in body
      const res = await fetch(`http://localhost:5000/admin/sellers/${sellerId}/verify`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ verify: false })
      });
      
      if (res.ok) {
        // Update local state
        setSellers(sellers.map(seller => 
          seller.id === sellerId ? { ...seller, is_verified: false, status: "pending" } : seller
        ));
        
        // Update selected seller if it's the same one
        if (selectedSeller && selectedSeller.id === sellerId) {
          setSelectedSeller(prev => prev ? { ...prev, is_verified: false, status: "pending" } : null);
        }
        
        // Show success message
        alert("Seller unverified successfully!");
      } else {
        const errorData = await res.json();
        throw new Error(errorData.msg || "Failed to unverify seller");
      }
    } catch (err: any) {
      console.error("Failed to unverify seller:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setVerifying(null);
    }
  };

  const handleViewDetails = (seller: Seller) => {
    setSelectedSeller(seller);
    setShowSidebar(true);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      suspended: "bg-red-100 text-red-800 border-red-200"
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading sellers...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-center">
        <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
        <div>
          <h3 className="font-semibold text-red-800">Error Loading Sellers</h3>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      </div>
      <button
        onClick={fetchSellers}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Management</h1>
          <p className="text-gray-600 mt-1">
            Total: {sellers.length} sellers • Showing: {filteredSellers.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Seller
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg border transition-colors ${filter === "all" ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
            >
              <Filter className="w-4 h-4 inline mr-2" />
              All
            </button>
            <button
              onClick={() => setFilter("verified")}
              className={`px-4 py-2 rounded-lg border transition-colors ${filter === "verified" ? "bg-green-50 border-green-300 text-green-700" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
            >
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Verified
            </button>
            <button
              onClick={() => setFilter("unverified")}
              className={`px-4 py-2 rounded-lg border transition-colors ${filter === "unverified" ? "bg-yellow-50 border-yellow-300 text-yellow-700" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
            >
              <XCircle className="w-4 h-4 inline mr-2" />
              Unverified
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sellers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{sellers.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {sellers.filter(s => s.is_verified).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {sellers.filter(s => !s.is_verified).length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {sellers.filter(s => {
                  const created = new Date(s.created_at || '');
                  const now = new Date();
                  return created.getMonth() === now.getMonth() && 
                         created.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Plus className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Seller Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedSellers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg">No sellers found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedSellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{seller.full_name}</div>
                          <div className="text-sm text-gray-500">ID: {seller.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          {seller.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="w-4 h-4 text-gray-400 mr-2" />
                          {seller.phone_number}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {getStatusBadge(seller.status || "pending")}
                        <div className="text-sm text-gray-500">
                          {seller.is_verified ? "Verified" : "Unverified"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {seller.created_at || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(seller)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => seller.is_verified ? handleUnverify(seller.id) : handleVerify(seller.id)}
                          disabled={verifying === seller.id}
                          className={`p-2 rounded-lg transition-colors ${seller.is_verified 
                            ? "text-red-600 hover:bg-red-50" 
                            : "text-yellow-600 hover:bg-yellow-50"
                          } ${verifying === seller.id ? "opacity-50 cursor-not-allowed" : ""}`}
                          title={seller.is_verified ? "Unverify Seller" : "Verify Seller"}
                        >
                          {verifying === seller.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Shield className="w-4 h-4" />
                          )}
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredSellers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">{Math.min(endIndex, filteredSellers.length)}</span> of{" "}
                <span className="font-medium">{filteredSellers.length}</span> sellers
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg border ${currentPage === pageNum 
                        ? "bg-blue-600 text-white border-blue-600" 
                        : "border-gray-300 hover:bg-gray-50"}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar - Seller Details */}
      {showSidebar && selectedSeller && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowSidebar(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white z-50 shadow-xl">
            <div className="h-full overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Seller Details</h2>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedSeller.full_name}</h3>
                    <div className="mt-2">
                      {getStatusBadge(selectedSeller.status || "pending")}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">ID</label>
                      <p className="text-gray-900">{selectedSeller.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900 flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedSeller.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900 flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedSeller.phone_number}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Verification Status</label>
                      <p className="text-gray-900 flex items-center">
                        {selectedSeller.is_verified ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                            Verified
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-2 text-yellow-500" />
                            Pending Verification
                          </>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Registered</label>
                      <p className="text-gray-900">{selectedSeller.created_at || "N/A"}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => selectedSeller.is_verified ? handleUnverify(selectedSeller.id) : handleVerify(selectedSeller.id)}
                        disabled={verifying === selectedSeller.id}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${selectedSeller.is_verified
                          ? "bg-red-100 text-red-700 border border-red-200 hover:bg-red-200"
                          : "bg-yellow-500 text-white hover:bg-yellow-600"
                        } ${verifying === selectedSeller.id ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {verifying === selectedSeller.id ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                            Processing...
                          </>
                        ) : selectedSeller.is_verified ? (
                          "Unverify"
                        ) : (
                          "Verify"
                        )}
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}