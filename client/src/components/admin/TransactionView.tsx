"use client";

import { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Package,
  Download,
  Filter as FilterIcon,
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
    success: "bg-green-50 border border-green-200 shadow-lg",
    error: "bg-red-50 border border-red-200 shadow-lg",
    info: "bg-blue-50 border border-blue-200 shadow-lg",
  };

  const textColor = {
    success: "text-green-800",
    error: "text-red-800",
    info: "text-blue-800",
  };

  const icon = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <XCircle className="w-5 h-5 text-red-600" />,
    info: <AlertCircle className="w-5 h-5 text-blue-600" />,
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

interface Transaction {
  id: number;
  user_id: number;
  seller_id: number;
  total_price: string;
  status: "buyer_confirmed" | "completed" | "pending" | "cancelled" | string;
  created_at: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  tax: number;
  total_with_tax: number;
}

interface Summary {
  total_transactions: number;
  total_revenue: string;
  total_tax: string;
  total_with_tax: string;
  by_status: Record<string, number>;
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "buyer_confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "buyer_confirmed":
        return <CheckCircle className="w-3 h-3" />;
      case "completed":
        return <CheckCircle className="w-3 h-3" />;
      case "pending":
        return <Clock className="w-3 h-3" />;
      case "cancelled":
        return <XCircle className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
        status
      )}`}
    >
      {getStatusIcon(status)}
      <span>{formatStatus(status)}</span>
    </div>
  );
};

export function TransactionsView() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const itemsPerPage = 10;

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("http://localhost:5000/admin/transactions", {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.msg ||
            errorData.message ||
            `Failed to fetch transactions: ${res.status} ${res.statusText}`
        );
      }

      const data = await res.json();

      // Handle the response format
      if (
        data.success &&
        data.transactions &&
        Array.isArray(data.transactions)
      ) {
        setTransactions(data.transactions);

        if (data.summary) {
          setSummary(data.summary);
        }

        showToast(`Loaded ${data.transactions.length} transactions`, "success");
      } else {
        throw new Error(data.msg || "Invalid response format from server");
      }
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      setError(err.message || "Failed to load transactions. Please try again.");
      showToast(err.message || "Failed to load transactions", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  // Format currency in Ethiopian Birr (ETB)
  const formatCurrency = (amount: string | number) => {
    try {
      const num =
        typeof amount === "string"
          ? parseFloat(amount.replace(/[^0-9.-]+/g, ""))
          : amount;

      return new Intl.NumberFormat("et-ET", {
        style: "currency",
        currency: "ETB",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);
    } catch {
      return "ETB 0.00";
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      transaction.buyer_name?.toLowerCase().includes(searchLower) ||
      transaction.buyer_email?.toLowerCase().includes(searchLower) ||
      (transaction.buyer_phone &&
        transaction.buyer_phone.includes(searchTerm)) ||
      transaction.id.toString().includes(searchTerm) ||
      transaction.user_id.toString().includes(searchTerm) ||
      transaction.seller_id.toString().includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || transaction.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(
    startIndex + itemsPerPage,
    filteredTransactions.length
  );
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Use summary data if available, otherwise calculate from transactions
  const totalTransactions = summary?.total_transactions || transactions.length;
  const totalRevenue = summary?.total_revenue
    ? parseFloat(summary.total_revenue)
    : transactions.reduce((sum, t) => {
        const price = parseFloat(t.total_price) || 0;
        return sum + price;
      }, 0);

  // Calculate tax as 15% of total revenue
  const TAX_RATE = 0.15;
  const calculatedTax = totalRevenue * TAX_RATE;

  // Use summary tax if available, otherwise use calculated tax
  const totalTax = summary?.total_tax
    ? parseFloat(summary.total_tax)
    : calculatedTax;

  const totalWithTax = summary?.total_with_tax
    ? parseFloat(summary.total_with_tax)
    : transactions.reduce((sum, t) => sum + (t.total_with_tax || 0), 0);

  // Get unique statuses for filter
  const uniqueStatuses = Array.from(new Set(transactions.map((t) => t.status)));

  // Export to CSV function
  const exportToCSV = () => {
    const headers = [
      "Transaction ID",
      "Buyer Name",
      "Buyer Email",
      "Buyer Phone",
      "Total Price (ETB)",
      "Tax (ETB)",
      "Total with Tax (ETB)",
      "Status",
      "Date",
      "User ID",
      "Seller ID",
    ];

    const csvContent = [
      headers.join(","),
      ...transactions.map((t) =>
        [
          t.id,
          `"${t.buyer_name}"`,
          `"${t.buyer_email}"`,
          `"${t.buyer_phone}"`,
          t.total_price,
          t.tax,
          t.total_with_tax,
          t.status,
          `"${new Date(t.created_at).toISOString()}"`,
          t.user_id,
          t.seller_id,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `transactions_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Error Loading Transactions
          </h3>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchTransactions}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
              <p className="text-gray-600 mt-2">
                View and manage all transactions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="font-medium">Export CSV</span>
              </button>
              <button
                onClick={fetchTransactions}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="font-medium">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {totalTransactions.toLocaleString()}
                  </p>
                </div>
                <div className="p-2 bg-white rounded-lg border border-gray-200">
                  <CreditCard className="w-5 h-5 text-gray-700" />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
                <div className="p-2 bg-white rounded-lg border border-gray-200">
                  <DollarSign className="w-5 h-5 text-gray-700" />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tax (15%)</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(totalTax)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {TAX_RATE * 100}% of revenue
                  </p>
                </div>
                <div className="p-2 bg-white rounded-lg border border-gray-200">
                  <Package className="w-5 h-5 text-gray-700" />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total with Tax</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(totalWithTax)}
                  </p>
                </div>
                <div className="p-2 bg-white rounded-lg border border-gray-200">
                  <DollarSign className="w-5 h-5 text-gray-700" />
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
                  placeholder="Search by name, email, phone, ID..."
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
              <FilterIcon className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-900"
              >
                <option value="all">All Status</option>
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status
                      .split("_")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left p-6 font-semibold text-gray-900 text-sm">
                  Transaction Details
                </th>
                <th className="text-left p-6 font-semibold text-gray-900 text-sm">
                  Buyer Information
                </th>
                <th className="text-left p-6 font-semibold text-gray-900 text-sm">
                  Amount (ETB)
                </th>
                <th className="text-left p-6 font-semibold text-gray-900 text-sm">
                  Status
                </th>
                <th className="text-left p-6 font-semibold text-gray-900 text-sm">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.length > 0 ? (
                currentTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-6">
                      <div>
                        <p className="font-medium text-gray-900">
                          Transaction #{transaction.id}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                          <span>Buyer ID: {transaction.user_id}</span>
                          <span className="text-gray-400">•</span>
                          <span>Seller ID: {transaction.seller_id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-3 h-3 text-gray-500" />
                          <span className="text-gray-900">
                            {transaction.buyer_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-3 h-3 text-gray-500" />
                          <span className="text-gray-600">
                            {transaction.buyer_email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3 text-gray-500" />
                          <span className="text-gray-600">
                            {transaction.buyer_phone}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(transaction.total_price)}
                        </p>
                        <div className="text-sm text-gray-600">
                          <div>Tax: {formatCurrency(transaction.tax)}</div>
                          <div className="font-medium">
                            Total: {formatCurrency(transaction.total_with_tax)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <StatusBadge status={transaction.status} />
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(transaction.created_at)}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Search className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500">
                        {searchTerm || statusFilter !== "all"
                          ? "No transactions match your filters"
                          : "No transactions found"}
                      </p>
                      {(searchTerm || statusFilter !== "all") && (
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("all");
                          }}
                          className="text-sm text-gray-600 hover:text-gray-900 underline"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredTransactions.length > itemsPerPage && (
          <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {endIndex} of{" "}
              {filteredTransactions.length} transactions
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
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
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium border transition-colors ${
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
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

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
