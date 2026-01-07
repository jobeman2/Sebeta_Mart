"use client";

import { useState, useEffect } from "react";
import {
  Download,
  TrendingUp,
  Users,
  UserCheck,
  FileText,
  Calendar,
  RefreshCw,
  BarChart3,
  DollarSign,
  Clock,
  TrendingDown,
  Percent,
} from "lucide-react";

interface Transaction {
  id: number;
  total_price: string;
  tax: number;
  total_with_tax: number;
  created_at: string;
  buyer_name?: string;
  buyer_email?: string;
  status?: string;
}

export function ReportsView() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalBuyers, setTotalBuyers] = useState<number>(0);
  const [totalSellers, setTotalSellers] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "monthly" | "annually" | "yearly"
  >("overview");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch transactions
      const resTx = await fetch("http://localhost:5000/admin/transactions", {
        credentials: "include",
      });
      const dataTx = await resTx.json();
      if (!dataTx.success || !Array.isArray(dataTx.transactions)) {
        throw new Error("Invalid transactions response");
      }
      setTransactions(dataTx.transactions);

      // Fetch buyers
      const resBuyers = await fetch("http://localhost:5000/admin/buyers", {
        credentials: "include",
      });
      const dataBuyers = await resBuyers.json();
      setTotalBuyers(dataBuyers.buyers?.length || 0);

      // Fetch sellers
      const resSellers = await fetch("http://localhost:5000/admin/sellers", {
        credentials: "include",
      });
      const dataSellers = await resSellers.json();
      setTotalSellers(dataSellers.sellers?.length || 0);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("et-ET", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 2,
    }).format(amount);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Aggregate monthly totals
  const monthlyTotals = transactions.reduce((acc: any, tx) => {
    const date = new Date(tx.created_at);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    const monthName = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthName,
        total: 0,
        tax: 0,
        totalWithTax: 0,
        count: 0,
      };
    }
    acc[monthKey].total += parseFloat(tx.total_price);
    acc[monthKey].tax += tx.tax;
    acc[monthKey].totalWithTax += tx.total_with_tax;
    acc[monthKey].count += 1;
    return acc;
  }, {});

  // Aggregate yearly totals
  const yearlyTotals = transactions.reduce((acc: any, tx) => {
    const year = new Date(tx.created_at).getFullYear();
    if (!acc[year]) acc[year] = { total: 0, tax: 0, totalWithTax: 0, count: 0 };
    acc[year].total += parseFloat(tx.total_price);
    acc[year].tax += tx.tax;
    acc[year].totalWithTax += tx.total_with_tax;
    acc[year].count += 1;
    return acc;
  }, {});

  // Aggregate annually (last 12 months rolling)
  const getAnnuallyData = () => {
    const now = new Date();
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(now.getMonth() - 11);

    const annualData = {
      currentYear: now.getFullYear(),
      previousYear: now.getFullYear() - 1,
      months: [] as Array<{
        name: string;
        currentYear: number;
        previousYear: number;
        change: number;
        changePercentage: number;
      }>,
      summary: {
        totalCurrentYear: 0,
        totalPreviousYear: 0,
        growth: 0,
        growthPercentage: 0,
      },
    };

    // Get transactions for current and previous year
    const currentYearTxs = transactions.filter((tx) => {
      const date = new Date(tx.created_at);
      return date.getFullYear() === annualData.currentYear;
    });

    const previousYearTxs = transactions.filter((tx) => {
      const date = new Date(tx.created_at);
      return date.getFullYear() === annualData.previousYear;
    });

    // Calculate monthly data
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    months.forEach((monthName, monthIndex) => {
      const currentMonthTotal = currentYearTxs
        .filter((tx) => new Date(tx.created_at).getMonth() === monthIndex)
        .reduce((sum, tx) => sum + parseFloat(tx.total_price), 0);

      const previousMonthTotal = previousYearTxs
        .filter((tx) => new Date(tx.created_at).getMonth() === monthIndex)
        .reduce((sum, tx) => sum + parseFloat(tx.total_price), 0);

      const change = currentMonthTotal - previousMonthTotal;
      const changePercentage =
        previousMonthTotal > 0
          ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) *
            100
          : 0;

      annualData.months.push({
        name: monthName,
        currentYear: currentMonthTotal,
        previousYear: previousMonthTotal,
        change,
        changePercentage,
      });
    });

    // Calculate summary
    annualData.summary.totalCurrentYear = currentYearTxs.reduce(
      (sum, tx) => sum + parseFloat(tx.total_price),
      0
    );

    annualData.summary.totalPreviousYear = previousYearTxs.reduce(
      (sum, tx) => sum + parseFloat(tx.total_price),
      0
    );

    annualData.summary.growth =
      annualData.summary.totalCurrentYear -
      annualData.summary.totalPreviousYear;
    annualData.summary.growthPercentage =
      annualData.summary.totalPreviousYear > 0
        ? (annualData.summary.growth / annualData.summary.totalPreviousYear) *
          100
        : 0;

    return annualData;
  };

  // Calculate totals
  const totalRevenue = transactions.reduce(
    (sum, tx) => sum + parseFloat(tx.total_price),
    0
  );
  const totalTax = transactions.reduce((sum, tx) => sum + tx.tax, 0);
  const grandTotal = transactions.reduce(
    (sum, tx) => sum + tx.total_with_tax,
    0
  );

  const handleExport = (type: "csv" | "pdf") => {
    console.log(`Exporting ${type} report`);
    // Add export logic here
  };

  const annualData = getAnnuallyData();

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
        <p className="text-gray-600 mt-4">Loading reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-xl p-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Financial Reports
            </h2>
            <p className="text-gray-600 mt-1">
              Comprehensive overview of platform financials and transactions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleExport("csv")}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => handleExport("pdf")}
              className="px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "monthly"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setActiveTab("annually")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "annually"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Annually
          </button>
          <button
            onClick={() => setActiveTab("yearly")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "yearly"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Users className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Buyers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalBuyers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Sellers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalSellers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <FileText className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {transactions.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Financial Summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Financial Summary
              </h3>
              <span className="text-sm text-gray-500">
                Total: {formatCurrency(grandTotal)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {formatCurrency(totalRevenue)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-gray-400" />
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    From {transactions.length} transactions
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tax Collected</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {formatCurrency(totalTax)}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Included in total</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Grand Total</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {formatCurrency(grandTotal)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-gray-400" />
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Revenue + Tax</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          {transactions.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Recent Transactions
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Latest {Math.min(5, transactions.length)} transactions
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Buyer
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tax
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.slice(0, 5).map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6 whitespace-nowrap text-gray-900">
                          {formatDate(tx.created_at)}
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-900">
                              {tx.buyer_name || "N/A"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {tx.buyer_email || ""}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-900">
                          {formatCurrency(parseFloat(tx.total_price))}
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {formatCurrency(tx.tax)}
                        </td>
                        <td className="py-4 px-6 font-bold text-gray-900">
                          {formatCurrency(tx.total_with_tax)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "monthly" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              Monthly Transaction Report
            </h3>
            <p className="text-gray-600 text-sm mt-1">Breakdown by month</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transactions
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tax
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. Transaction
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(monthlyTotals)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([key, data]: [string, any]) => (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {data.month}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {data.count}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-900">
                        {formatCurrency(data.total)}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {formatCurrency(data.tax)}
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-900">
                        {formatCurrency(data.totalWithTax)}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {formatCurrency(data.total / data.count)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "annually" && (
        <div className="space-y-6">
          {/* Annual Growth Summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Annual Growth Analysis
              </h3>
              <div className="text-right">
                <p className="text-sm text-gray-500">YoY Growth</p>
                <p
                  className={`text-lg font-bold ${
                    annualData.summary.growthPercentage >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {annualData.summary.growthPercentage >= 0 ? "+" : ""}
                  {annualData.summary.growthPercentage.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Current Year ({annualData.currentYear})
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {formatCurrency(annualData.summary.totalCurrentYear)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-gray-400" />
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Previous Year ({annualData.previousYear})
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {formatCurrency(annualData.summary.totalPreviousYear)}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Growth</p>
                    <p
                      className={`text-2xl font-bold mt-2 ${
                        annualData.summary.growth >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {annualData.summary.growth >= 0 ? "+" : ""}
                      {formatCurrency(annualData.summary.growth)}
                    </p>
                  </div>
                  <Percent className="w-8 h-8 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Comparison */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Monthly Comparison ({annualData.currentYear} vs{" "}
                {annualData.previousYear})
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Month-over-month revenue comparison
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {annualData.previousYear}
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {annualData.currentYear}
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Change
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % Change
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {annualData.months.map((month) => (
                    <tr key={month.name} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {month.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {formatCurrency(month.previousYear)}
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-900">
                        {formatCurrency(month.currentYear)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1">
                          {month.change >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                          <span
                            className={`font-medium ${
                              month.change >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {month.change >= 0 ? "+" : ""}
                            {formatCurrency(month.change)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            month.changePercentage >= 0
                              ? "text-green-600 bg-green-50"
                              : "text-red-600 bg-red-50"
                          }`}
                        >
                          {month.changePercentage >= 0 ? "+" : ""}
                          {month.changePercentage.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "yearly" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              Yearly Transaction Report
            </h3>
            <p className="text-gray-600 text-sm mt-1">Breakdown by year</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transactions
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tax
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(yearlyTotals)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([year, data]: [string, any]) => (
                    <tr key={year} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {year}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {data.count}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-900">
                        {formatCurrency(data.total)}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {formatCurrency(data.tax)}
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-900">
                        {formatCurrency(data.totalWithTax)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
