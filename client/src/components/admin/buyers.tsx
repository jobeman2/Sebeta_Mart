"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  User,
  Mail,
  Phone,
  ShoppingBag,
  Eye,
  MessageSquare,
  Download,
  RefreshCw,
  MoreVertical,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  DollarSign,
  Activity,
  CheckCircle,
  XCircle,
  BarChart3,
  CreditCard,
  MapPin
} from "lucide-react";

interface Buyer {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  created_at?: string;
  transaction_count?: number;
  total_spent?: number;
  last_active?: string;
  location?: string;
  status?: "active" | "inactive" | "new";
}

interface PurchaseHistory {
  id: number;
  property_id: string;
  property_name: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "cancelled";
}

export default function BuyersList() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "new">("all");
  const [sortBy, setSortBy] = useState<"name" | "recent" | "spent">("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const itemsPerPage = 12;

  const fetchBuyers = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/admin/buyers", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to fetch buyers: ${res.status}`);
      const json = await res.json();
      const buyersData = json.buyers || json;
      
      // Enhance data with mock details for demo
      const enhancedData: Buyer[] = buyersData.map((buyer: any, index: number) => ({
        ...buyer,
        created_at: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0],
        transaction_count: Math.floor(Math.random() * 20),
        total_spent: Math.floor(Math.random() * 1000000) + 10000,
        last_active: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        location: ["New York", "Los Angeles", "Chicago", "Miami", "Seattle"][index % 5],
        status: index < 3 ? "new" : "active"
      }));
      
      setBuyers(enhancedData);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseHistory = async (buyerId: number) => {
    // Mock purchase history for demo
    const mockHistory: PurchaseHistory[] = [
      { id: 1, property_id: "P001", property_name: "Luxury Villa", amount: 750000, date: "2024-01-15", status: "completed" },
      { id: 2, property_id: "P002", property_name: "Downtown Apartment", amount: 450000, date: "2024-02-10", status: "completed" },
      { id: 3, property_id: "P003", property_name: "Beach House", amount: 1200000, date: "2024-03-05", status: "pending" },
    ];
    setPurchaseHistory(mockHistory);
  };

  useEffect(() => {
    fetchBuyers();
  }, []);

  useEffect(() => {
    if (selectedBuyer) {
      fetchPurchaseHistory(selectedBuyer.id);
    }
  }, [selectedBuyer]);

  // Filter and sort buyers
  const filteredBuyers = buyers.filter(buyer => {
    const matchesSearch = searchTerm === "" || 
      buyer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.phone_number.includes(searchTerm) ||
      buyer.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === "all" || 
      (filter === "active" && buyer.status === "active") ||
      (filter === "new" && buyer.status === "new");
    
    return matchesSearch && matchesFilter;
  });

  const sortedBuyers = [...filteredBuyers].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.full_name.localeCompare(b.full_name);
      case "spent":
        return (b.total_spent || 0) - (a.total_spent || 0);
      case "recent":
      default:
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedBuyers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBuyers = sortedBuyers.slice(startIndex, endIndex);

  const handleViewDetails = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setShowSidebar(true);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
      new: "bg-blue-100 text-blue-800 border-blue-200"
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.active}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTransactionStatusBadge = (status: string) => {
    const styles = {
      completed: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      cancelled: "bg-red-100 text-red-800 border-red-200"
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
        <p className="mt-4 text-gray-600">Loading buyers...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-center">
        <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
        <div>
          <h3 className="font-semibold text-red-800">Error Loading Buyers</h3>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      </div>
      <button
        onClick={fetchBuyers}
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
          <h1 className="text-2xl font-bold text-gray-900">Buyer Management</h1>
          <p className="text-gray-600 mt-1">
            Total: {buyers.length} buyers • Showing: {filteredBuyers.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 ${viewMode === "table" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              Grid
            </button>
          </div>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
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
                placeholder="Search by name, email, location..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Most Recent</option>
              <option value="name">Name A-Z</option>
              <option value="spent">Highest Spent</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg border transition-colors ${filter === "all" ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`px-4 py-2 rounded-lg border transition-colors ${filter === "active" ? "bg-green-50 border-green-300 text-green-700" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter("new")}
                className={`px-4 py-2 rounded-lg border transition-colors ${filter === "new" ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
              >
                New
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Buyers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{buyers.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Buyers</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {buyers.filter(b => b.status === "active").length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {formatCurrency(buyers.reduce((sum, b) => sum + (b.total_spent || 0), 0))}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Transactions</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {(buyers.reduce((sum, b) => sum + (b.transaction_count || 0), 0) / buyers.length || 0).toFixed(1)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Buyers Table/Grid */}
      {viewMode === "table" ? (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedBuyers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-400">
                        <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-lg">No buyers found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filter</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedBuyers.map((buyer) => (
                    <tr key={buyer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{buyer.full_name}</div>
                            <div className="text-sm text-gray-500">ID: {buyer.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="w-4 h-4 text-gray-400 mr-2" />
                            {buyer.email}
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="w-4 h-4 text-gray-400 mr-2" />
                            {buyer.phone_number}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="font-medium">{buyer.transaction_count || 0}</span> purchases
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatCurrency(buyer.total_spent || 0)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          {buyer.location || "Unknown"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(buyer.status || "active")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(buyer)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <MessageSquare className="w-4 h-4" />
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
          {sortedBuyers.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(endIndex, sortedBuyers.length)}</span> of{" "}
                  <span className="font-medium">{sortedBuyers.length}</span> buyers
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
      ) : (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedBuyers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400">
                <User className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p className="text-lg">No buyers found</p>
                <p className="text-sm mt-1">Try adjusting your search or filter</p>
              </div>
            </div>
          ) : (
            paginatedBuyers.map((buyer) => (
              <div key={buyer.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">{buyer.full_name}</h3>
                      <div className="text-xs text-gray-500">ID: {buyer.id}</div>
                    </div>
                  </div>
                  {getStatusBadge(buyer.status || "active")}
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="truncate">{buyer.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    {buyer.phone_number}
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    {buyer.location || "Unknown"}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-600">Purchases</div>
                    <div className="font-semibold text-gray-900">{buyer.transaction_count || 0}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-600">Total Spent</div>
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(buyer.total_spent || 0).replace('$', '$')}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(buyer)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    View Details
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Sidebar - Buyer Details */}
      {showSidebar && selectedBuyer && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowSidebar(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white z-50 shadow-xl">
            <div className="h-full overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Buyer Details</h2>
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
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedBuyer.full_name}</h3>
                    <div className="mt-2">
                      {getStatusBadge(selectedBuyer.status || "active")}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">ID</label>
                      <p className="text-gray-900">{selectedBuyer.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900 flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedBuyer.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900 flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedBuyer.phone_number}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Location</label>
                      <p className="text-gray-900 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedBuyer.location || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Registered</label>
                      <p className="text-gray-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedBuyer.created_at || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Purchase Stats */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Purchase Statistics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Purchases</p>
                        <p className="text-lg font-bold text-gray-900">{selectedBuyer.transaction_count || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Spent</p>
                        <p className="text-lg font-bold text-purple-600">
                          {formatCurrency(selectedBuyer.total_spent || 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Purchase History */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Recent Purchases</h4>
                    <div className="space-y-3">
                      {purchaseHistory.map((purchase) => (
                        <div key={purchase.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-gray-900">{purchase.property_name}</p>
                              <p className="text-sm text-gray-500">{purchase.property_id}</p>
                            </div>
                            {getTransactionStatusBadge(purchase.status)}
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{purchase.date}</span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(purchase.amount)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex gap-3">
                      <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Contact
                      </button>
                      <button className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        View Profile
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