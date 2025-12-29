"use client";

import { useEffect, useState, useContext, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthContext } from "@/context/Authcontext";
import {
  ArrowLeft,
  CheckCircle,
  Package,
  User,
  Phone,
  Mail,
  CreditCard,
  Truck,
  Calendar,
  Loader2,
  AlertCircle,
  RefreshCw,
  XCircle,
  Ban,
  ShieldCheck,
  MapPin,
  Navigation,
  Star,
  Clock,
  Hash,
  Shield,
  Sparkles,
  Trophy,
  Award,
  BadgeCheck,
  Heart,
  Zap,
  Target,
  Rocket,
  TrendingUp,
} from "lucide-react";

// Animated Success Toast Component
const AnimatedToast = ({
  message,
  type = "success",
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info" | "warning";
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getConfig = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-gradient-to-r from-emerald-50 to-green-50",
          border: "border border-emerald-200",
          icon: <Sparkles className="w-5 h-5 text-emerald-600" />,
          accent: "border-l-4 border-l-emerald-500",
        };
      case "error":
        return {
          bg: "bg-gradient-to-r from-rose-50 to-red-50",
          border: "border border-rose-200",
          icon: <AlertCircle className="w-5 h-5 text-rose-600" />,
          accent: "border-l-4 border-l-rose-500",
        };
      case "warning":
        return {
          bg: "bg-gradient-to-r from-amber-50 to-orange-50",
          border: "border border-amber-200",
          icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
          accent: "border-l-4 border-l-amber-500",
        };
      case "info":
        return {
          bg: "bg-gradient-to-r from-blue-50 to-sky-50",
          border: "border border-blue-200",
          icon: <ShieldCheck className="w-5 h-5 text-blue-600" />,
          accent: "border-l-4 border-l-blue-500",
        };
    }
  };

  const config = getConfig();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div
        className={`${config.bg} ${config.border} rounded-xl shadow-lg p-4 flex items-start gap-3 animate-slideInRight ${config.accent}`}
      >
        <div className="flex-shrink-0 animate-pulse">{config.icon}</div>
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

// Animated Confirmation Dialog Component
const AnimatedConfirmationDialog = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  type = "warning",
}: {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "warning" | "danger" | "info";
}) => {
  if (!isOpen) return null;

  const getButtonColor = () => {
    switch (type) {
      case "danger":
        return "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700";
      case "info":
        return "bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700";
      default:
        return "bg-gradient-to-r from-gray-900 to-slate-900 hover:from-gray-800 hover:to-slate-800";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-scaleIn">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-gray-900" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-6">{message}</p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-300 font-medium border border-gray-300 hover:border-gray-400"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${getButtonColor()} text-white shadow-sm hover:shadow-md`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Delivery Person Info Component
const EnhancedDeliveryPersonInfo = ({
  deliveryPerson,
  order,
}: {
  deliveryPerson: any;
  order: any;
}) => {
  if (!deliveryPerson) return null;

  const getStatusConfig = () => {
    switch (order.status?.toLowerCase()) {
      case "buyer_confirmed":
        return {
          bg: "bg-gradient-to-r from-emerald-50 to-green-50",
          border: "border border-emerald-200",
          text: "text-emerald-700",
          icon: <Trophy className="w-5 h-5 text-emerald-600" />,
        };
      case "delivered":
        return {
          bg: "bg-gradient-to-r from-rose-50 to-pink-50",
          border: "border border-rose-200",
          text: "text-rose-700",
          icon: <CheckCircle className="w-5 h-5 text-rose-600" />,
        };
      case "in_transit":
        return {
          bg: "bg-gradient-to-r from-blue-50 to-sky-50",
          border: "border border-blue-200",
          text: "text-blue-700",
          icon: <Truck className="w-5 h-5 text-blue-600" />,
        };
      default:
        return {
          bg: "bg-gradient-to-r from-gray-50 to-slate-50",
          border: "border border-gray-300",
          text: "text-gray-700",
          icon: <Clock className="w-5 h-5 text-gray-600" />,
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="bg-white rounded-2xl border border-gray-300 p-6 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg">
            <Truck className="w-6 h-6 text-gray-900" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Delivery Information
          </h3>
        </div>
        <div
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text}`}
        >
          {statusConfig.icon}
          {order.status?.replace("_", " ") || "Pending"}
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="group">
              <p className="text-xs text-gray-500 mb-1">Delivery Person</p>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <User className="w-4 h-4 text-gray-700" />
                </div>
                <p className="font-medium text-gray-900">
                  {deliveryPerson.full_name}
                </p>
              </div>
            </div>
            <div className="group">
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-4 h-4 text-gray-700" />
                </div>
                <p className="font-medium text-gray-900">
                  {deliveryPerson.email}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="group">
              <p className="text-xs text-gray-500 mb-1">Phone Number</p>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-4 h-4 text-gray-700" />
                </div>
                <p className="font-medium text-gray-900">
                  {deliveryPerson.phone_number || "—"}
                </p>
              </div>
            </div>
            <div className="group">
              <p className="text-xs text-gray-500 mb-1">Location</p>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-4 h-4 text-gray-700" />
                </div>
                <p className="font-medium text-gray-900">
                  {deliveryPerson.location || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-300">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Performance Metrics</h4>
            <TrendingUp className="w-5 h-5 text-gray-600" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center group">
              <div className="text-2xl font-bold text-gray-900 mb-1 group-hover:scale-110 transition-transform duration-300">
                {deliveryPerson.rating ? deliveryPerson.rating.toFixed(1) : "—"}
              </div>
              <div className="flex items-center justify-center gap-1">
                <Star className="w-3 h-3 text-yellow-500" />
                <p className="text-xs text-gray-600">Rating</p>
              </div>
            </div>
            <div className="text-center group">
              <div className="text-2xl font-bold text-gray-900 mb-1 group-hover:scale-110 transition-transform duration-300">
                {deliveryPerson.completed_deliveries || 0}
              </div>
              <p className="text-xs text-gray-600">Completed</p>
            </div>
            <div className="text-center group">
              <div className="text-2xl font-bold text-gray-900 mb-1 group-hover:scale-110 transition-transform duration-300">
                {deliveryPerson.current_deliveries || 0}
              </div>
              <p className="text-xs text-gray-600">Active</p>
            </div>
            <div className="text-center group">
              <div className="text-2xl font-bold text-gray-900 mb-1 group-hover:scale-110 transition-transform duration-300">
                {deliveryPerson.is_available ? "Yes" : "No"}
              </div>
              <p className="text-xs text-gray-600">Available</p>
            </div>
          </div>
        </div>

        {/* Contact Card */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-300 gap-4">
          <div className="flex-1">
            <p className="font-medium text-gray-900">Delivery Status</p>
            <p className="text-sm text-gray-600">
              {order.status === "buyer_confirmed"
                ? "✅ Successfully delivered and confirmed"
                : order.status === "delivered"
                ? "📦 Delivered - Awaiting confirmation"
                : order.status === "in_transit"
                ? "🚚 Package in transit"
                : "⏳ Preparing for delivery"}
            </p>
          </div>
          <button
            onClick={() => window.open(`tel:${deliveryPerson.phone_number}`)}
            disabled={!deliveryPerson.phone_number}
            className="px-6 py-3 bg-gradient-to-r from-gray-900 to-slate-900 text-white rounded-xl hover:from-gray-800 hover:to-slate-800 transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Call Delivery
          </button>
        </div>
      </div>
    </div>
  );
};

// Animated Status Badge Component
const AnimatedStatusBadge = ({ status }: { status: string }) => {
  const getConfig = () => {
    switch (status?.toLowerCase()) {
      case "buyer_confirmed":
        return {
          bg: "bg-gradient-to-r from-emerald-500 to-green-600",
          text: "text-white",
          icon: <Trophy className="w-4 h-4" />,
          label: "Order Confirmed",
          pulse: true,
        };
      case "delivered":
        return {
          bg: "bg-gradient-to-r from-rose-500 to-pink-600",
          text: "text-white",
          icon: <CheckCircle className="w-4 h-4" />,
          label: "Delivered",
          pulse: false,
        };
      case "in_transit":
        return {
          bg: "bg-gradient-to-r from-blue-500 to-sky-600",
          text: "text-white",
          icon: <Truck className="w-4 h-4" />,
          label: "In Transit",
          pulse: false,
        };
      case "payment_confirmed":
        return {
          bg: "bg-gradient-to-r from-purple-500 to-indigo-600",
          text: "text-white",
          icon: <CreditCard className="w-4 h-4" />,
          label: "Payment Confirmed",
          pulse: false,
        };
      case "processing":
        return {
          bg: "bg-gradient-to-r from-amber-500 to-orange-600",
          text: "text-white",
          icon: <Clock className="w-4 h-4" />,
          label: "Processing",
          pulse: false,
        };
      default:
        return {
          bg: "bg-gradient-to-r from-gray-500 to-slate-600",
          text: "text-white",
          icon: <Package className="w-4 h-4" />,
          label: status?.replace("_", " ") || "Pending",
          pulse: false,
        };
    }
  };

  const config = getConfig();

  return (
    <span
      className={`px-4 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 shadow-md ${
        config.bg
      } ${config.text} ${config.pulse ? "animate-pulse" : ""}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useContext(AuthContext);

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deliveryUsers, setDeliveryUsers] = useState<any[]>([]);
  const [deliveryPersonInfo, setDeliveryPersonInfo] = useState<any>(null);
  const [loadingDeliveryInfo, setLoadingDeliveryInfo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);

  // State for dialogs
  const [showConfirmPaymentDialog, setShowConfirmPaymentDialog] =
    useState(false);
  const [showUndoPaymentDialog, setShowUndoPaymentDialog] = useState(false);
  const [showAssignDeliveryDialog, setShowAssignDeliveryDialog] =
    useState(false);
  const [selectedDeliveryUser, setSelectedDeliveryUser] = useState<any>(null);

  // State for actions
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [undoingPayment, setUndoingPayment] = useState(false);
  const [assigning, setAssigning] = useState<number | null>(null);

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info" | "warning";
  } | null>(null);

  const showToast = useCallback(
    (
      message: string,
      type: "success" | "error" | "info" | "warning" = "info"
    ) => {
      setToast({ message, type });
    },
    []
  );

  const closeToast = () => {
    setToast(null);
  };

  const fetchOrder = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/singleOrder/${id}`, {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 404) {
          setError("Order not found");
        } else {
          setError(`Error: ${res.status} ${res.statusText}`);
        }
        setOrder(null);
        return;
      }

      const data = await res.json();

      if (!data.order) {
        setError("Order data not found in response");
        return;
      }

      setOrder(data.order);
      setDeliveryUsers(data.deliveryUsers || []);
      setIsOrderConfirmed(data.order.status === "buyer_confirmed");

      // If order has delivery_id, fetch delivery person info
      if (data.order.delivery_id) {
        fetchDeliveryPersonInfo(data.order.delivery_id);
      }
    } catch (err: any) {
      console.error("Error loading order:", err);
      setError("Failed to load order. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryPersonInfo = async (deliveryId: number) => {
    setLoadingDeliveryInfo(true);
    try {
      const res = await fetch(
        `http://localhost:5000/singleOrder/${id}/delivery-info`,
        {
          credentials: "include",
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.delivery_person) {
          setDeliveryPersonInfo(data.delivery_person);
        }
      }
    } catch (err) {
      console.error("Error fetching delivery info:", err);
    } finally {
      setLoadingDeliveryInfo(false);
    }
  };

  useEffect(() => {
    if (id && !authLoading) {
      fetchOrder();
    }
  }, [id, authLoading]);

  // Fix image URL
  const fixImageUrl = (url: string) => {
    if (!url) return null;
    return url.replace(/([^:]\/)\/+/g, "$1");
  };

  // Confirm payment
  const handleConfirmPayment = async () => {
    setConfirmingPayment(true);
    setShowConfirmPaymentDialog(false);

    try {
      const res = await fetch(
        `http://localhost:5000/singleOrder/confirm-payment/${id}`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to confirm payment");

      showToast("Payment confirmed successfully! 🎉", "success");
      fetchOrder();
    } catch (err: any) {
      showToast(err.message || "Error confirming payment", "error");
    } finally {
      setConfirmingPayment(false);
    }
  };

  // Undo payment confirmation
  const handleUndoPayment = async () => {
    setUndoingPayment(true);
    setShowUndoPaymentDialog(false);

    try {
      const res = await fetch(
        `http://localhost:5000/singleOrder/undo-payment/${id}`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to undo payment");

      showToast("Payment confirmation undone!", "info");
      fetchOrder();
    } catch (err: any) {
      showToast(err.message || "Error undoing payment", "error");
    } finally {
      setUndoingPayment(false);
    }
  };

  // Assign delivery person
  const handleAssignDelivery = async () => {
    if (!selectedDeliveryUser) return;

    const deliveryIdNum = Number(selectedDeliveryUser.delivery_id);

    if (isNaN(deliveryIdNum)) {
      showToast("Invalid delivery person ID!", "error");
      return;
    }

    setAssigning(deliveryIdNum);
    setShowAssignDeliveryDialog(false);

    try {
      const res = await fetch(
        `http://localhost:5000/singleOrder/${id}/assign-delivery`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ delivery_id: deliveryIdNum }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to assign delivery");

      showToast(
        `🚚 Delivery assigned to ${selectedDeliveryUser.full_name}!`,
        "success"
      );
      fetchOrder();
    } catch (err: any) {
      showToast(err.message || "Error assigning delivery", "error");
    } finally {
      setAssigning(null);
      setSelectedDeliveryUser(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const telebirrScreenshotUrl = fixImageUrl(order?.telebirr_screenshot);
  const productImageUrl = fixImageUrl(order?.product_image);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-900 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 animate-pulse">
              Loading Order Details
            </h3>
            <p className="text-gray-600 mt-2">Fetching your order...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-gray-300 rounded-2xl p-8 shadow-lg">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-r from-rose-50 to-red-50 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-rose-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Order Not Found
              </h3>
              <p className="text-gray-700 mb-4">
                {error || "The order could not be found."}
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Order ID: {id}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={fetchOrder}
                className="px-6 py-3 bg-gradient-to-r from-gray-900 to-slate-900 text-white rounded-xl hover:from-gray-800 hover:to-slate-800 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="px-6 py-3 bg-white text-gray-900 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2 font-medium border border-gray-300 hover:border-gray-400"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const showConfirmButton =
    order.payment_method === "telebirr" &&
    order.payment_status !== "payment_confirmed" &&
    !!order.telebirr_txn_number;

  const showUndoButton =
    order.payment_method === "telebirr" &&
    order.payment_status === "payment_confirmed";

  const showAssignDelivery =
    order.payment_status === "payment_confirmed" && !order.delivery_id;

  return (
    <>
      {/* Toast Notifications */}
      {toast && (
        <AnimatedToast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}

      {/* Confirmation Dialog for Payment */}
      <AnimatedConfirmationDialog
        isOpen={showConfirmPaymentDialog}
        title="Confirm Payment"
        message="Are you sure you want to confirm this payment? This action cannot be undone."
        confirmText="Confirm Payment"
        cancelText="Cancel"
        onConfirm={handleConfirmPayment}
        onCancel={() => setShowConfirmPaymentDialog(false)}
        type="info"
      />

      {/* Confirmation Dialog for Undo Payment */}
      <AnimatedConfirmationDialog
        isOpen={showUndoPaymentDialog}
        title="Undo Payment Confirmation"
        message="Are you sure you want to undo this payment confirmation? The order will return to pending payment status."
        confirmText="Undo Payment"
        cancelText="Cancel"
        onConfirm={handleUndoPayment}
        onCancel={() => setShowUndoPaymentDialog(false)}
        type="warning"
      />

      {/* Confirmation Dialog for Assign Delivery */}
      <AnimatedConfirmationDialog
        isOpen={showAssignDeliveryDialog && selectedDeliveryUser}
        title="Assign Delivery Person"
        message={`Assign ${selectedDeliveryUser?.full_name} to this delivery?`}
        confirmText="Assign"
        cancelText="Cancel"
        onConfirm={handleAssignDelivery}
        onCancel={() => {
          setShowAssignDeliveryDialog(false);
          setSelectedDeliveryUser(null);
        }}
        type="info"
      />

      {/* Confetti Effect for Confirmed Orders */}
      {isOrderConfirmed && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
            </div>
          ))}
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-50">
        {/* Animated Header */}
        <div className="bg-white border-b border-gray-300 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="p-3 rounded-xl hover:bg-gray-100 transition-all duration-300 border border-gray-300 hover:border-gray-400 group"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-900 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Order #{order.order_id}
                  </h1>
                  <p className="text-gray-600 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(order.created_at)}
                  </p>
                </div>
              </div>

              <AnimatedStatusBadge status={order.status} />
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Information */}
              <div
                className={`bg-white rounded-2xl border p-6 transition-all duration-500 ${
                  isOrderConfirmed
                    ? "border-emerald-300 shadow-lg"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-xl ${
                        isOrderConfirmed
                          ? "bg-gradient-to-r from-emerald-50 to-green-50"
                          : "bg-gradient-to-r from-gray-50 to-slate-50"
                      }`}
                    >
                      <Package className="w-6 h-6 text-gray-900" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Product Details
                    </h3>
                  </div>
                  {isOrderConfirmed && (
                    <BadgeCheck className="w-8 h-8 text-emerald-500 animate-bounce" />
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                  {productImageUrl && (
                    <div className="flex-shrink-0">
                      <div
                        className={`w-48 h-48 rounded-xl overflow-hidden border ${
                          isOrderConfirmed
                            ? "border-emerald-300 shadow-md"
                            : "border-gray-300"
                        }`}
                      >
                        <img
                          src={productImageUrl}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          alt={order.product_name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-900 mb-3">
                      {order.product_name}
                    </h4>
                    <p className="text-gray-700 mb-6">
                      {order.product_description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="group">
                          <p className="text-sm text-gray-600 mb-1">
                            Unit Price
                          </p>
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-gray-600" />
                            <p className="text-lg font-semibold text-gray-900">
                              ETB {order.product_price}
                            </p>
                          </div>
                        </div>
                        <div className="group">
                          <p className="text-sm text-gray-600 mb-1">Quantity</p>
                          <div className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-gray-600" />
                            <p className="text-lg font-semibold text-gray-900">
                              {order.quantity}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="group">
                          <p className="text-sm text-gray-600 mb-1">
                            Total Amount
                          </p>
                          <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-gray-600" />
                            <p
                              className={`text-3xl font-bold ${
                                isOrderConfirmed
                                  ? "text-emerald-700"
                                  : "text-gray-900"
                              }`}
                            >
                              ETB {order.total_price}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-white rounded-2xl border border-gray-300 p-6 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl">
                    <User className="w-6 h-6 text-gray-900" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Customer Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="group">
                      <p className="text-xs text-gray-500 mb-1">Full Name</p>
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-600" />
                        <p className="font-medium text-gray-900">
                          {order.buyer_name}
                        </p>
                      </div>
                    </div>
                    <div className="group">
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <p className="font-medium text-gray-900">
                          {order.buyer_email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="group">
                      <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-600" />
                        <p className="font-medium text-gray-900">
                          {order.buyer_phone}
                        </p>
                      </div>
                    </div>
                    <div className="group">
                      <p className="text-xs text-gray-500 mb-1">Order Date</p>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <p className="font-medium text-gray-900">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Person Information */}
              {order.delivery_id &&
                (loadingDeliveryInfo ? (
                  <div className="bg-white rounded-2xl border border-gray-300 p-6">
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center space-y-4">
                        <Loader2 className="w-12 h-12 text-gray-900 animate-spin mx-auto" />
                        <p className="text-gray-600">
                          Loading delivery information...
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <EnhancedDeliveryPersonInfo
                    deliveryPerson={
                      deliveryPersonInfo || order.delivery_person_name
                        ? {
                            full_name: order.delivery_person_name,
                            email: order.delivery_person_email,
                            phone_number: order.delivery_person_phone,
                          }
                        : null
                    }
                    order={order}
                  />
                ))}
            </div>

            {/* Right Column - Actions & Details */}
            <div className="space-y-6">
              {/* Order Details */}
              <div
                className={`bg-white rounded-2xl border p-6 ${
                  isOrderConfirmed
                    ? "border-emerald-300 shadow-lg"
                    : "border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Order Details
                  </h3>
                  {isOrderConfirmed && (
                    <Trophy className="w-6 h-6 text-emerald-500" />
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center group">
                    <span className="text-gray-700">Status</span>
                    <AnimatedStatusBadge status={order.status} />
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-gray-700">Payment Method</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {order.payment_method}
                    </span>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-gray-700">Payment Status</span>
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        order.payment_status === "payment_confirmed"
                          ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                          : "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-900"
                      }`}
                    >
                      {order.payment_status.replace("_", " ")}
                    </span>
                  </div>
                  {order.delivery_id && (
                    <div className="flex justify-between items-center group">
                      <span className="text-gray-700">Delivery Person</span>
                      <span className="font-medium text-gray-900">
                        {deliveryPersonInfo?.full_name ||
                          order.delivery_person_name ||
                          "—"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Telebirr Payment Section */}
              {order.payment_method === "telebirr" && (
                <div className="bg-white rounded-2xl border border-gray-300 p-6 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl">
                      <CreditCard className="w-6 h-6 text-gray-900" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Payment Details
                    </h3>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center group">
                      <span className="text-gray-700">Transaction No.</span>
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-gray-500" />
                        <span className="font-mono font-semibold text-gray-900">
                          {order.telebirr_txn_number || "—"}
                        </span>
                      </div>
                    </div>

                    {telebirrScreenshotUrl && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          Payment Screenshot
                        </p>
                        <div className="border border-gray-300 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300">
                          <img
                            src={telebirrScreenshotUrl}
                            className="w-full h-48 object-contain bg-gray-50 hover:scale-105 transition-transform duration-500"
                            alt="Telebirr payment screenshot"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {showConfirmButton && (
                        <button
                          onClick={() => setShowConfirmPaymentDialog(true)}
                          disabled={confirmingPayment}
                          className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl hover:from-blue-700 hover:to-sky-700 transition-all duration-300 font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {confirmingPayment ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              Confirm Payment
                            </>
                          )}
                        </button>
                      )}

                      {showUndoButton && (
                        <button
                          onClick={() => setShowUndoPaymentDialog(true)}
                          disabled={undoingPayment || order.delivery_id}
                          className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium flex items-center justify-center gap-2 border border-gray-300 hover:border-gray-400 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {undoingPayment ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Ban className="w-5 h-5" />
                              Undo Payment
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Assign Delivery Section */}
              {showAssignDelivery && (
                <div className="bg-white rounded-2xl border border-gray-300 p-6 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl">
                      <Truck className="w-6 h-6 text-gray-900" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Assign Delivery
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {deliveryUsers.length > 0 ? (
                      deliveryUsers.map((delivery) => (
                        <div
                          key={delivery.delivery_id}
                          className="flex items-center justify-between p-4 border border-gray-300 rounded-xl hover:border-gray-900 hover:shadow-md transition-all duration-300 group"
                        >
                          <div>
                            <p className="font-medium text-gray-900 group-hover:text-gray-900 transition-colors">
                              {delivery.full_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {delivery.email}
                            </p>
                            {delivery.rating && (
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3 h-3 text-yellow-500" />
                                <span className="text-xs text-gray-700">
                                  {delivery.rating.toFixed(1)} •{" "}
                                  {delivery.completed_deliveries || 0}{" "}
                                  deliveries
                                </span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedDeliveryUser(delivery);
                              setShowAssignDeliveryDialog(true);
                            }}
                            disabled={
                              assigning === Number(delivery.delivery_id)
                            }
                            className="px-4 py-2 bg-gradient-to-r from-gray-900 to-slate-900 text-white rounded-lg hover:from-gray-800 hover:to-slate-800 transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {assigning === Number(delivery.delivery_id) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Rocket className="w-4 h-4" />
                                Assign
                              </>
                            )}
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Truck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-700">
                          No delivery persons available
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Global Animations */}
      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes confetti {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }

        .animate-confetti {
          animation: confetti linear forwards;
        }

        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
      `}</style>
    </>
  );
}
