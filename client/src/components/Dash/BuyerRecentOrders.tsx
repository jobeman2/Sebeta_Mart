"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  ArrowRight,
  AlertCircle,
  Loader2,
  AlertTriangle,
  MapPin,
  User,
  Phone,
  ShoppingBag,
  DollarSign,
  Calendar,
  RefreshCw,
  Navigation,
  MessageSquare,
  ShieldCheck,
  X,
  ChevronRight,
  Check,
  Receipt,
  Printer,
  Download,
  Copy,
  Home,
} from "lucide-react";
import Link from "next/link";

interface BuyerOrder {
  order_id: number;
  product_id: number;
  seller_id: number;
  quantity: number;
  total_price: string;
  status: string;
  delivery_id: number | null;
  vehicle_type: string | null;
  delivery_name: string | null;
  delivery_phone: string | null;
  delivery_latitude: string | null;
  delivery_longitude: string | null;
  created_at?: string;
  product_name?: string;
  seller_name?: string;
  address?: string;
  estimated_delivery?: string;
  product_details?: {
    description?: string;
    category?: string;
  };
  payment_method?: string;
  transaction_id?: string;
}

interface BuyerOrdersDashboardProps {
  limit?: number;
  showOnlyPendingConfirmation?: boolean;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export default function BuyerOrdersDashboard({
  limit = 10,
  showOnlyPendingConfirmation = false,
}: BuyerOrdersDashboardProps) {
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [confirmingOrder, setConfirmingOrder] = useState<number | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<BuyerOrder | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Toast functions
  const showToast = useCallback(
    (message: string, type: Toast["type"] = "success") => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);

      // Auto remove toast after 4 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Toast component
  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm transition-all duration-300 animate-slideIn ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : toast.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          {toast.type === "success" && (
            <div className="w-8 h-8 rounded-full bg-green-100 border border-green-300 flex items-center justify-center">
              <Check className="w-4 h-4 text-green-600" />
            </div>
          )}
          {toast.type === "error" && (
            <div className="w-8 h-8 rounded-full bg-red-100 border border-red-300 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 p-1 hover:bg-white/50 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );

  // Fetch buyer orders
  const fetchOrders = useCallback(async () => {
    setRefreshing(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/buyer/orders", {
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to fetch orders");
      }

      const data = await res.json();
      setOrders(data.orders || []);
      showToast("Orders refreshed successfully", "success");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load orders");
      setOrders([]);
      showToast(err.message || "Failed to load orders", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter orders that need confirmation (delivered but not buyer_confirmed)
  const ordersNeedingConfirmation = orders.filter(
    (order) => order.status === "delivered"
  );

  const deliveredAndConfirmed = orders.filter(
    (order) => order.status === "buyer_confirmed"
  );

  const activeOrders = orders.filter(
    (order) =>
      order.status !== "delivered" && order.status !== "buyer_confirmed"
  );

  const displayedOrders = showOnlyPendingConfirmation
    ? ordersNeedingConfirmation.slice(0, limit)
    : orders.slice(0, limit);

  // Get status configuration - Updated with green borders for confirmed
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "buyer_confirmed":
        return {
          bgColor: "bg-green-50",
          textColor: "text-green-800",
          borderColor: "border-green-300",
          icon: <CheckCircle className="w-4 h-4 text-green-600" />,
          text: "Delivery Confirmed",
          variant: "confirmed",
          iconColor: "text-green-600",
        };
      case "pending":
      case "confirmed":
        return {
          bgColor: "bg-gray-100",
          textColor: "text-gray-900",
          borderColor: "border-gray-300",
          icon: <Clock className="w-4 h-4 text-gray-600" />,
          text: "Processing",
          variant: "pending",
          iconColor: "text-gray-600",
        };
      case "processing":
      case "assigned_for_delivery":
        return {
          bgColor: "bg-blue-50",
          textColor: "text-blue-800",
          borderColor: "border-blue-300",
          icon: <Truck className="w-4 h-4 text-blue-600" />,
          text: "On the Way",
          variant: "processing",
          iconColor: "text-blue-600",
        };
      case "delivered":
        return {
          bgColor: "bg-black",
          textColor: "text-white",
          borderColor: "border-black",
          icon: <CheckCircle className="w-4 h-4" />,
          text: "Delivered - Confirm Receipt",
          variant: "delivered",
          iconColor: "text-white",
        };
      case "cancelled":
        return {
          bgColor: "bg-red-50",
          textColor: "text-red-800",
          borderColor: "border-red-300",
          icon: <AlertCircle className="w-4 h-4 text-red-600" />,
          text: "Cancelled",
          variant: "cancelled",
          iconColor: "text-red-600",
        };
      default:
        return {
          bgColor: "bg-gray-100",
          textColor: "text-gray-900",
          borderColor: "border-gray-300",
          icon: <Package className="w-4 h-4 text-gray-600" />,
          text: status.charAt(0).toUpperCase() + status.slice(1),
          variant: "default",
          iconColor: "text-gray-600",
        };
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format price
  const formatPrice = (price: string) => {
    return parseFloat(price).toLocaleString("en-ET", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Get delivery person info
  const getDeliveryInfo = (order: BuyerOrder) => {
    if (!order.delivery_id) return null;

    return {
      name: order.delivery_name || "Delivery Person",
      phone: order.delivery_phone,
      vehicle: order.vehicle_type || "Vehicle",
      hasLocation: !!(order.delivery_latitude && order.delivery_longitude),
    };
  };

  // Open confirmation modal
  const openConfirmationModal = (order: BuyerOrder) => {
    setSelectedOrder(order);
    setShowConfirmationModal(true);
  };

  // Open receipt modal
  const openReceiptModal = (order: BuyerOrder) => {
    setSelectedOrder(order);
    setShowReceiptModal(true);
  };

  // Close receipt modal
  const closeReceiptModal = () => {
    setShowReceiptModal(false);
    setSelectedOrder(null);
  };

  // Confirm delivery receipt
  const confirmDeliveryReceipt = async () => {
    if (!selectedOrder) return;

    setConfirmingOrder(selectedOrder.order_id);

    try {
      const res = await fetch(
        `http://localhost:5000/buyer/orders/${selectedOrder.order_id}/buyer-confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({}),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to confirm delivery");
      }

      const result = await res.json();

      if (result.success) {
        // Update local state immediately
        setOrders((prev) =>
          prev.map((order) =>
            order.order_id === selectedOrder.order_id
              ? { ...order, status: "buyer_confirmed" }
              : order
          )
        );

        // Show success toast
        showToast(
          `Order #${selectedOrder.order_id} confirmed successfully!`,
          "success"
        );

        setShowConfirmationModal(false);
        setSelectedOrder(null);
      } else {
        throw new Error(result.message || "Failed to update order status");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to confirm delivery", "error");
      console.error(err);
    } finally {
      setConfirmingOrder(null);
    }
  };

  // Track delivery
  const trackDelivery = (order: BuyerOrder) => {
    if (order.delivery_latitude && order.delivery_longitude) {
      const url = `https://www.google.com/maps?q=${order.delivery_latitude},${order.delivery_longitude}`;
      window.open(url, "_blank");
      showToast("Opening delivery location in maps...", "info");
    } else {
      showToast("Live tracking not available for this order", "info");
    }
  };

  // Contact delivery person
  const contactDelivery = (phone: string | null) => {
    if (phone) {
      window.open(`tel:${phone}`, "_blank");
      showToast(`Calling ${phone}...`, "info");
    } else {
      showToast("Contact number not available", "info");
    }
  };

  // Calculate tax and totals
  const calculateReceiptTotals = (order: BuyerOrder) => {
    const subtotal = parseFloat(order.total_price) || 0;
    const taxRate = 0.15; // 15% tax
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return {
      subtotal,
      tax,
      total,
      taxRate: taxRate * 100, // 15%
    };
  };

  // Print receipt
  const printReceipt = () => {
    if (!selectedOrder) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showToast("Could not open print window. Please allow popups.", "error");
      return;
    }

    const receipt = generateReceiptHTML(selectedOrder);
    printWindow.document.write(receipt);
    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Download receipt as PDF
  const downloadReceipt = () => {
    if (!selectedOrder) return;
    showToast("Receipt download feature coming soon!", "info");
    // TODO: Implement PDF generation and download
  };

  // Copy receipt to clipboard
  const copyReceiptDetails = () => {
    if (!selectedOrder) return;

    const totals = calculateReceiptTotals(selectedOrder);
    const receiptText = `
Order Receipt
Order ID: ${selectedOrder.order_id}
Date: ${formatDate(selectedOrder.created_at)}
Product: ${selectedOrder.product_name || `Product #${selectedOrder.product_id}`}
Quantity: ${selectedOrder.quantity}
Subtotal: ETB ${totals.subtotal.toFixed(2)}
Tax (${totals.taxRate}%): ETB ${totals.tax.toFixed(2)}
Total: ETB ${totals.total.toFixed(2)}
Status: ${selectedOrder.status}
Thank you for your purchase!
    `.trim();

    navigator.clipboard
      .writeText(receiptText)
      .then(() => showToast("Receipt copied to clipboard!", "success"))
      .catch(() => showToast("Failed to copy receipt", "error"));
  };

  // Generate receipt HTML for printing
  const generateReceiptHTML = (order: BuyerOrder) => {
    const totals = calculateReceiptTotals(order);

    return `
<!DOCTYPE html>
<html>
<head>
  <title>Receipt - Order #${order.order_id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', sans-serif;
      padding: 20px;
      max-width: 400px;
      margin: 0 auto;
      color: #1f2937;
      background: white;
    }
    .receipt-header {
      text-align: center;
      border-bottom: 2px dashed #d1d5db;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .company-name {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 5px;
    }
    .company-tagline {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 15px;
    }
    .receipt-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 5px;
    }
    .order-info {
      margin-bottom: 25px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .info-label {
      color: #6b7280;
      font-weight: 500;
    }
    .info-value {
      font-weight: 600;
    }
    .items-section {
      margin: 25px 0;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #111827;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 5px;
    }
    .item-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px dashed #e5e7eb;
    }
    .item-name {
      font-weight: 500;
    }
    .item-quantity {
      color: #6b7280;
      font-size: 13px;
    }
    .item-price {
      font-weight: 600;
    }
    .totals-section {
      margin: 25px 0;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e5e7eb;
    }
    .total-label {
      color: #6b7280;
    }
    .total-value {
      font-weight: 600;
    }
    .tax-row {
      color: #ef4444;
    }
    .grand-total {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      border-top: 2px solid #111827;
      padding-top: 10px;
      margin-top: 10px;
    }
    .footer-section {
      margin-top: 30px;
      text-align: center;
      border-top: 2px dashed #d1d5db;
      padding-top: 20px;
    }
    .thank-you {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 10px;
      color: #111827;
    }
    .contact-info {
      font-size: 12px;
      color: #6b7280;
      line-height: 1.4;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 5px;
    }
    .status-confirmed { background: #10b981; color: white; }
    .status-delivered { background: #3b82f6; color: white; }
    .status-processing { background: #f59e0b; color: white; }
    .print-date {
      font-size: 11px;
      color: #9ca3af;
      text-align: center;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="receipt-header">
    <div class="company-name">BoleFarm</div>
    <div class="company-tagline">Fresh Produce Marketplace</div>
    <div class="receipt-title">ORDER RECEIPT</div>
  </div>

  <div class="order-info">
    <div class="info-row">
      <span class="info-label">Receipt No:</span>
      <span class="info-value">#${order.order_id}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Date:</span>
      <span class="info-value">${formatDate(order.created_at)}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Order Status:</span>
      <span class="info-value">
        <span class="status-badge status-${order.status}">
          ${order.status.replace("_", " ").toUpperCase()}
        </span>
      </span>
    </div>
  </div>

  <div class="items-section">
    <div class="section-title">PRODUCT DETAILS</div>
    <div class="item-row">
      <div>
        <div class="item-name">${
          order.product_name || `Product #${order.product_id}`
        }</div>
        <div class="item-quantity">Quantity: ${order.quantity}</div>
      </div>
      <div class="item-price">ETB ${(
        parseFloat(order.total_price) || 0
      ).toFixed(2)}</div>
    </div>
  </div>

  <div class="totals-section">
    <div class="section-title">PAYMENT SUMMARY</div>
    <div class="total-row">
      <span class="total-label">Subtotal</span>
      <span class="total-value">ETB ${totals.subtotal.toFixed(2)}</span>
    </div>
    <div class="total-row tax-row">
      <span class="total-label">Tax (${totals.taxRate}%)</span>
      <span class="total-value">ETB ${totals.tax.toFixed(2)}</span>
    </div>
    <div class="total-row grand-total">
      <span class="total-label">Total Amount</span>
      <span class="total-value">ETB ${totals.total.toFixed(2)}</span>
    </div>
  </div>

  <div class="footer-section">
    <div class="thank-you">Thank You For Your Order!</div>
    <div class="contact-info">
      BoleFarm Marketplace<br>
      support@bolefarm.com<br>
      +251 123 456 789
    </div>
  </div>

  <div class="print-date">
    Printed on: ${new Date().toLocaleDateString()}
  </div>
</body>
</html>
    `;
  };

  // Confirmation Modal Component
  const ConfirmationModal = () => {
    if (!showConfirmationModal || !selectedOrder) return null;

    const deliveryInfo = getDeliveryInfo(selectedOrder);
    const isAlreadyConfirmed = selectedOrder.status === "buyer_confirmed";
    const statusConfig = getStatusConfig(selectedOrder.status);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white border border-gray-300 max-w-md w-full rounded-xl overflow-hidden">
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${statusConfig.bgColor} border ${statusConfig.borderColor}`}
                >
                  {statusConfig.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {isAlreadyConfirmed
                      ? "Delivery Confirmed"
                      : "Confirm Delivery Receipt"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Order #{selectedOrder.order_id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowConfirmationModal(false);
                  setSelectedOrder(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {/* Order Summary */}
            <div className="border border-gray-300 rounded-lg p-4 mb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {selectedOrder.product_name ||
                      `Product #${selectedOrder.product_id}`}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Quantity: {selectedOrder.quantity} • Total: ETB{" "}
                    {formatPrice(selectedOrder.total_price)}
                  </p>
                  {selectedOrder.created_at && (
                    <p className="text-xs text-gray-500 mt-2">
                      Ordered on {formatDate(selectedOrder.created_at)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            {deliveryInfo && (
              <div className="border border-gray-300 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Delivery Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <User className="w-4 h-4 text-gray-700" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900 font-medium">
                        {deliveryInfo.name}
                      </p>
                      <p className="text-xs text-gray-600">Delivery Person</p>
                    </div>
                  </div>
                  {deliveryInfo.phone && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Phone className="w-4 h-4 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 font-medium">
                          {deliveryInfo.phone}
                        </p>
                        <p className="text-xs text-gray-600">Contact</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Truck className="w-4 h-4 text-gray-700" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900 font-medium">
                        {deliveryInfo.vehicle}
                      </p>
                      <p className="text-xs text-gray-600">Vehicle Type</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation Message */}
            {!isAlreadyConfirmed && (
              <div className="border border-yellow-300 bg-yellow-50 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-700 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium mb-1">
                      Important Notice
                    </p>
                    <p className="text-sm text-yellow-700">
                      By confirming delivery, you acknowledge that you have
                      received the order in satisfactory condition.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Already Confirmed Message */}
            {isAlreadyConfirmed && (
              <div className="border border-green-300 bg-green-50 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-700 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-green-800 font-medium mb-1">
                      Delivery Confirmed
                    </p>
                    <p className="text-sm text-green-700">
                      You confirmed this delivery on{" "}
                      {formatDate(selectedOrder.created_at)}.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-gray-300">
            {isAlreadyConfirmed ? (
              <button
                onClick={() => {
                  setShowConfirmationModal(false);
                  setSelectedOrder(null);
                }}
                className="w-full px-4 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-colors font-medium rounded-lg"
              >
                Close
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmationModal(false);
                    setSelectedOrder(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeliveryReceipt}
                  disabled={confirmingOrder === selectedOrder.order_id}
                  className="flex-1 px-4 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-colors font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {confirmingOrder === selectedOrder.order_id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Confirm Receipt
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Receipt Modal Component
  const ReceiptModal = () => {
    if (!showReceiptModal || !selectedOrder) return null;

    const totals = calculateReceiptTotals(selectedOrder);
    const statusConfig = getStatusConfig(selectedOrder.status);
    const deliveryInfo = getDeliveryInfo(selectedOrder);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white border border-gray-300 max-w-2xl w-full rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-300 sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 border border-gray-300 rounded-lg">
                  <Receipt className="w-6 h-6 text-gray-900" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xl">
                    Order Receipt
                  </h3>
                  <p className="text-sm text-gray-600">
                    #{selectedOrder.order_id} •{" "}
                    {formatDate(selectedOrder.created_at)}
                  </p>
                </div>
              </div>
              <button
                onClick={closeReceiptModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Receipt Content */}
          <div className="p-6">
            {/* Company Header */}
            <div className="text-center mb-8 border-b border-dashed border-gray-300 pb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                BoleFarm
              </h2>
              <p className="text-gray-600">Fresh Produce Marketplace</p>
              <p className="text-sm text-gray-500 mt-1">
                Addis Ababa, Ethiopia
              </p>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border border-gray-300 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-3">
                  Order Information
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">
                      #{selectedOrder.order_id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="font-medium">
                      {formatDate(selectedOrder.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}
                    >
                      {statusConfig.icon}
                      {statusConfig.text}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-300 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-3">
                  Delivery Information
                </h4>
                <div className="space-y-3">
                  {deliveryInfo && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Person:</span>
                        <span className="font-medium">{deliveryInfo.name}</span>
                      </div>
                      {deliveryInfo.phone && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Contact:</span>
                          <span className="font-medium">
                            {deliveryInfo.phone}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vehicle:</span>
                        <span className="font-medium">
                          {deliveryInfo.vehicle}
                        </span>
                      </div>
                    </>
                  )}
                  {!deliveryInfo && (
                    <p className="text-gray-500 text-sm">
                      Delivery information not available
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="border border-gray-300 rounded-lg p-4 mb-8">
              <h4 className="font-bold text-gray-900 mb-4">Product Details</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedOrder.product_name ||
                        `Product #${selectedOrder.product_id}`}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Quantity: {selectedOrder.quantity} × ETB{" "}
                      {(
                        parseFloat(selectedOrder.total_price) /
                        selectedOrder.quantity
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-lg">
                      ETB {formatPrice(selectedOrder.total_price)}
                    </p>
                    <p className="text-sm text-gray-600">Subtotal</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="border border-gray-300 rounded-lg p-4 mb-8">
              <h4 className="font-bold text-gray-900 mb-4">Payment Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">
                    ETB {totals.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-y border-gray-200">
                  <div>
                    <span className="text-gray-600">Tax:</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({totals.taxRate}%)
                    </span>
                  </div>
                  <span className="font-medium text-red-600">
                    ETB {totals.tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-900 font-bold text-lg">
                    Total:
                  </span>
                  <span className="text-gray-900 font-bold text-lg">
                    ETB {totals.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center border-t border-dashed border-gray-300 pt-8">
              <p className="text-gray-900 font-bold text-lg mb-2">
                Thank You For Your Purchase!
              </p>
              <p className="text-gray-600 text-sm">
                BoleFarm Marketplace • support@bolefarm.com • +251 123 456 789
              </p>
              <p className="text-gray-500 text-xs mt-4">
                This receipt was generated on {new Date().toLocaleDateString()}{" "}
                at {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-t border-gray-300 bg-gray-50 sticky bottom-0">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={copyReceiptDetails}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium rounded-lg flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Receipt
              </button>
              <button
                onClick={printReceipt}
                className="flex-1 px-4 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-colors font-medium rounded-lg flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>
              <button
                onClick={downloadReceipt}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium rounded-lg flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && orders.length === 0) {
    return (
      <>
        <ToastContainer />
        <div className="bg-white border border-gray-300 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 border border-gray-300 rounded-lg">
                <Package className="w-6 h-6 text-gray-900" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {showOnlyPendingConfirmation
                  ? "Confirm Deliveries"
                  : "My Orders"}
              </h2>
            </div>
          </div>
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ToastContainer />
        <div className="bg-white border border-gray-300 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 border border-gray-300 rounded-lg">
                <Package className="w-6 h-6 text-gray-900" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {showOnlyPendingConfirmation
                  ? "Confirm Deliveries"
                  : "My Orders"}
              </h2>
            </div>
          </div>
          <div className="border border-gray-300 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-gray-900" />
              <div>
                <p className="font-medium text-gray-900">
                  Failed to load orders
                </p>
                <p className="text-sm text-gray-700 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchOrders}
              className="mt-4 px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors rounded-lg flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer />
      <ConfirmationModal />
      <ReceiptModal />
      <div className="bg-white border border-gray-300 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 border border-gray-300 rounded-lg">
                {showOnlyPendingConfirmation ? (
                  <ShieldCheck className="w-6 h-6 text-gray-900" />
                ) : (
                  <Package className="w-6 h-6 text-gray-900" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {showOnlyPendingConfirmation
                    ? "Confirm Deliveries"
                    : "My Orders"}
                </h2>
                <p className="text-sm text-gray-600">
                  {showOnlyPendingConfirmation
                    ? "Confirm receipt of your delivered orders"
                    : "Track and manage your purchases"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Refresh */}
              <button
                onClick={fetchOrders}
                disabled={refreshing}
                className="p-2 border border-gray-300 hover:bg-gray-50 transition-colors rounded-lg disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Banner for Confirmations Needed */}
        {showOnlyPendingConfirmation &&
          ordersNeedingConfirmation.length > 0 && (
            <div className="p-6 border-b border-gray-300 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 border border-gray-300 bg-white rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-gray-900" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-gray-900">
                      {ordersNeedingConfirmation.length} Deliveries Awaiting
                      Confirmation
                    </p>
                    <p className="text-sm text-gray-600">
                      Confirm receipt to update order status
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Content Area */}
        <div className="p-6">
          {/* No Orders State */}
          {displayedOrders.length === 0 ? (
            <div className="text-center py-8 border border-gray-300 rounded-lg">
              {showOnlyPendingConfirmation ? (
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-gray-400" />
                </div>
              ) : (
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {showOnlyPendingConfirmation
                  ? "No Deliveries to Confirm"
                  : "No Orders Found"}
              </h3>
              <p className="text-gray-600 mb-4">
                {showOnlyPendingConfirmation
                  ? "All your delivered orders have been confirmed"
                  : "Start shopping to see your orders here"}
              </p>
              {!showOnlyPendingConfirmation && (
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors font-medium rounded-lg"
                >
                  <Package className="w-4 h-4" />
                  Browse Products
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Orders Count */}
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Showing {displayedOrders.length} order
                  {displayedOrders.length !== 1 ? "s" : ""}
                  {showOnlyPendingConfirmation && " requiring confirmation"}
                </p>
              </div>

              {/* Orders List */}
              {displayedOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const deliveryInfo = getDeliveryInfo(order);
                const isConfirmed = order.status === "buyer_confirmed";
                const canShowReceipt = [
                  "buyer_confirmed",
                  "delivered",
                  "completed",
                ].includes(order.status);

                return (
                  <div
                    key={order.order_id}
                    className={`border rounded-lg hover:border-gray-400 transition-colors ${
                      isConfirmed
                        ? "border-green-300 bg-green-50/50"
                        : "border-gray-300"
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">
                              Order #{order.order_id}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}
                            >
                              {statusConfig.icon}
                              {statusConfig.text}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(order.created_at)}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-900">
                            ETB {formatPrice(order.total_price)}
                          </span>
                          {canShowReceipt && (
                            <button
                              onClick={() => openReceiptModal(order)}
                              className="p-2 border border-gray-300 hover:bg-gray-50 transition-colors rounded-lg"
                              title="View Receipt"
                            >
                              <Receipt className="w-4 h-4 text-gray-700" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5">
                            <ShoppingBag className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">
                              {order.quantity} item
                              {order.quantity > 1 ? "s" : ""}
                            </span>
                          </div>

                          {deliveryInfo && (
                            <div className="flex items-center gap-1.5">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">
                                {deliveryInfo.name}
                              </span>
                            </div>
                          )}
                        </div>

                        {order.product_name && (
                          <p className="text-sm text-gray-700 truncate max-w-[200px]">
                            {order.product_name}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-300">
                        <div className="flex items-center gap-2">
                          {/* Receipt Button */}
                          {canShowReceipt && (
                            <button
                              onClick={() => openReceiptModal(order)}
                              className="px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg text-xs font-medium flex items-center gap-1.5"
                            >
                              <Receipt className="w-3 h-3" />
                              View Receipt
                            </button>
                          )}

                          {deliveryInfo && deliveryInfo.phone && (
                            <button
                              onClick={() =>
                                contactDelivery(deliveryInfo.phone)
                              }
                              className="px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg text-xs font-medium flex items-center gap-1.5"
                            >
                              <Phone className="w-3 h-3" />
                              Contact Delivery
                            </button>
                          )}
                          {deliveryInfo && deliveryInfo.hasLocation && (
                            <button
                              onClick={() => trackDelivery(order)}
                              className="px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg text-xs font-medium flex items-center gap-1.5"
                            >
                              <Navigation className="w-3 h-3" />
                              Track Delivery
                            </button>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {order.status === "delivered" && !isConfirmed && (
                          <button
                            onClick={() => openConfirmationModal(order)}
                            className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors rounded-lg text-sm font-medium flex items-center gap-2"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            Confirm Delivery
                          </button>
                        )}

                        {isConfirmed && (
                          <button
                            onClick={() => openConfirmationModal(order)}
                            className="px-4 py-2 border border-green-300 bg-green-50 text-green-800 hover:bg-green-100 transition-colors rounded-lg text-sm font-medium flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            View Confirmation
                          </button>
                        )}

                        {/* For non-delivered orders, show Confirm button */}
                        {order.status !== "delivered" && !isConfirmed && (
                          <button
                            onClick={() => openConfirmationModal(order)}
                            disabled={order.status !== "delivered"}
                            className={`px-4 py-2 border text-sm font-medium flex items-center justify-center gap-2 rounded-lg ${
                              order.status === "delivered"
                                ? "bg-gray-900 text-white hover:bg-gray-800 border-gray-900"
                                : "border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed"
                            }`}
                          >
                            <Clock className="w-4 h-4" />
                            Awaiting Delivery
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* View All Link */}
          {!showOnlyPendingConfirmation && orders.length > limit && (
            <div className="mt-6 pt-6 border-t border-gray-300">
              <Link
                href="/orders"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1.5 group justify-center"
              >
                View all orders
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}

          {/* Link to Confirmations Page */}
          {!showOnlyPendingConfirmation &&
            ordersNeedingConfirmation.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-300">
                <Link
                  href="/orders/confirm"
                  className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors flex items-center gap-1.5 group justify-center"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Confirm {ordersNeedingConfirmation.length} delivered order
                  {ordersNeedingConfirmation.length !== 1 ? "s" : ""}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
        </div>
      </div>
    </>
  );
}
