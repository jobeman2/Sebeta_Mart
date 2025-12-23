"use client";
import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/Authcontext";
import {
  Store,
  MapPin,
  FileText,
  User,
  IdCard,
  Building,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Shield,
  Globe,
  Package,
  TrendingUp,
  XCircle,
} from "lucide-react";

interface Props {
  onShopCreated: (seller: any) => void;
  existingShop?: any; // Pass existing shop data if shop exists
}

export default function CreateShopForm({ onShopCreated, existingShop }: Props) {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const [shopName, setShopName] = useState("");
  const [shopDesc, setShopDesc] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [businessLicense, setBusinessLicense] = useState("");
  const [governmentId, setGovernmentId] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [error, setError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Pre-fill form if editing existing shop
  useEffect(() => {
    if (existingShop) {
      setShopName(existingShop.shop_name || "");
      setShopDesc(existingShop.shop_description || "");
      setShopAddress(existingShop.shop_address || "");
      setBusinessLicense(existingShop.business_license || "");
      setGovernmentId(existingShop.government_id || "");
      setNationalId(existingShop.national_id_number || "");
    }
  }, [existingShop]);

  // Redirect to dashboard if shop already exists and we're not editing
  if (existingShop && !formLoading && !success && isSubmitted) {
    router.push("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsSubmitted(true);

    if (loading || !user) {
      setError("Please log in to continue");
      return;
    }

    if (!shopName.trim()) {
      setError("Shop name is required");
      return;
    }

    setFormLoading(true);
    setCurrentStep(1);

    // Simulate progress steps
    const steps = [1, 2, 3, 4];
    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setCurrentStep(steps[i]);
    }

    try {
      const url = existingShop
        ? `http://localhost:5000/sellers/${existingShop.id}`
        : "http://localhost:5000/sellers";
      const method = existingShop ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          shop_name: shopName.trim(),
          shop_description: shopDesc.trim(),
          shop_address: shopAddress.trim(),
          business_license: businessLicense.trim(),
          government_id: governmentId.trim(),
          national_id_number: nationalId.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to process your request");
      } else {
        setSuccess(true);
        onShopCreated(data);

        // Redirect after success
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setFormLoading(false);
      setCurrentStep(1);
    }
  };

  const formFields = [
    {
      id: "shopName",
      label: "Shop Name",
      placeholder: "Enter a memorable shop name",
      value: shopName,
      onChange: setShopName,
      icon: Store,
      required: true,
      description: "This will be your public storefront name",
    },
    {
      id: "shopDesc",
      label: "Shop Description",
      placeholder:
        "What makes your shop special? Describe your products and values...",
      value: shopDesc,
      onChange: setShopDesc,
      icon: FileText,
      required: false,
      description: "Help customers understand your business",
      type: "textarea",
    },
    {
      id: "shopAddress",
      label: "Shop Address",
      placeholder: "Enter your business address",
      value: shopAddress,
      onChange: setShopAddress,
      icon: MapPin,
      required: false,
      description: "For order fulfillment and customer trust",
    },
    {
      id: "businessLicense",
      label: "Business License",
      placeholder: "Business license number",
      value: businessLicense,
      onChange: setBusinessLicense,
      icon: Building,
      required: false,
      description: "Required for verification",
    },
    {
      id: "governmentId",
      label: "Government ID",
      placeholder: "Government issued ID number",
      value: governmentId,
      onChange: setGovernmentId,
      icon: Shield,
      required: false,
      description: "For official verification",
    },
    {
      id: "nationalId",
      label: "National ID",
      placeholder: "National identification number",
      value: nationalId,
      onChange: setNationalId,
      icon: IdCard,
      required: false,
      description: "Additional identity verification",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#3399FF]/20 border-t-[#3399FF] rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading your information...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <User className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          Login Required
        </h3>
        <p className="text-gray-600 mb-6">Please sign in to create your shop</p>
        <button
          onClick={() => router.push("/auth/login")}
          className="px-6 py-3 bg-[#3399FF] text-white rounded-lg hover:bg-[#2980d6] transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center space-y-8">
          <div className="relative">
            <div className="w-32 h-32 mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#3399FF] to-[#EF837B] rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute inset-4 bg-gradient-to-br from-[#3399FF] to-[#EF837B] rounded-full flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-[#EF837B] to-gray-800 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {existingShop ? "Shop Updated!" : "Shop Created!"}
            </h1>
            <p className="text-gray-600 text-lg">
              {existingShop
                ? "Your shop has been updated successfully"
                : "Welcome to the seller community!"}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#3399FF]/10 rounded-lg flex items-center justify-center">
                    <Store className="w-5 h-5 text-[#3399FF]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{shopName}</p>
                    <p className="text-sm text-gray-600">Shop Name</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Active
                </div>
              </div>

              {shopDesc && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-gray-600 line-clamp-3">{shopDesc}</p>
                </div>
              )}

              {shopAddress && (
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{shopAddress}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Add Products</p>
                  <p className="text-sm text-gray-600">Start listing items</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Go Live</p>
                  <p className="text-sm text-gray-600">Start selling</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Track Growth</p>
                  <p className="text-sm text-gray-600">Monitor sales</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <div className="w-2 h-2 bg-[#3399FF] rounded-full animate-ping"></div>
              <span>Redirecting to dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (formLoading) {
    const steps = [
      {
        number: 1,
        title: "Validating Information",
        description: "Checking all required details",
      },
      {
        number: 2,
        title: "Processing Request",
        description: "Setting up your shop profile",
      },
      {
        number: 3,
        title: "Creating Storefront",
        description: "Building your digital shop",
      },
      {
        number: 4,
        title: "Finalizing Setup",
        description: "Almost ready to launch",
      },
    ];

    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {existingShop ? "Updating Your Shop" : "Setting Up Your Shop"}
          </h2>
          <p className="text-gray-600">
            {existingShop
              ? "We're updating your shop details..."
              : "Getting everything ready for your launch..."}
          </p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#3399FF] via-[#8B5CF6] to-[#EF837B] transition-all duration-700 ease-out rounded-full"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex items-start gap-4 p-4 rounded-lg border transition-all duration-300 ${
                  step.number <= currentStep
                    ? "bg-white border-[#3399FF]/20 shadow-sm"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.number < currentStep
                      ? "bg-gradient-to-br from-[#3399FF] to-[#8B5CF6] text-white"
                      : step.number === currentStep
                      ? "bg-gradient-to-br from-[#3399FF] to-[#8B5CF6] text-white animate-pulse"
                      : "bg-gray-300 text-gray-500"
                  }`}
                >
                  {step.number < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{step.number}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      step.number <= currentStep
                        ? "text-gray-900"
                        : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#3399FF]/10 to-[#EF837B]/10 rounded-2xl mb-6">
          <Store className="w-8 h-8 text-[#3399FF]" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {existingShop ? "Edit Shop Details" : "Create Your Shop"}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {existingShop
            ? "Update your shop information to keep your business profile fresh"
            : "Set up your digital storefront in just a few steps. Start selling today."}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-300 overflow-hidden">
        {/* Form Header */}
        <div className="border-b border-gray-300 p-8 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Shop Information
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Fill in your shop details below. All fields marked with * are
                required.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-800">Error</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-8">
            {/* Shop Name & Description */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block">
                  <span className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-2">
                    <Store className="w-4 h-4 text-[#3399FF]" />
                    Shop Name *
                  </span>
                  <input
                    type="text"
                    placeholder="e.g., Fashion Haven, Tech Gadgets"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3399FF]/20 focus:border-[#3399FF] transition-all"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Choose a memorable name for your shop
                  </p>
                </label>
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-[#EF837B]" />
                    Shop Address
                  </span>
                  <input
                    type="text"
                    placeholder="Your business location"
                    value={shopAddress}
                    onChange={(e) => setShopAddress(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3399FF]/20 focus:border-[#3399FF] transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Helps with delivery and customer trust
                  </p>
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-700" />
                  Shop Description
                </span>
                <textarea
                  placeholder="Describe your shop, products, and what makes you special..."
                  value={shopDesc}
                  onChange={(e) => setShopDesc(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3399FF]/20 focus:border-[#3399FF] transition-all resize-none min-h-[120px]"
                />
                <p className="text-xs text-gray-500 mt-2">
                  This helps customers understand your business better
                </p>
              </label>
            </div>

            {/* Verification Fields */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    Verification Details
                  </h3>
                  <p className="text-sm text-gray-600">
                    For account security and trust
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-900 mb-2 block">
                      Business License
                    </span>
                    <input
                      type="text"
                      placeholder="License number"
                      value={businessLicense}
                      onChange={(e) => setBusinessLicense(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3399FF]/20 focus:border-[#3399FF] transition-all"
                    />
                  </label>
                </div>

                <div className="space-y-3">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-900 mb-2 block">
                      Government ID
                    </span>
                    <input
                      type="text"
                      placeholder="ID number"
                      value={governmentId}
                      onChange={(e) => setGovernmentId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3399FF]/20 focus:border-[#3399FF] transition-all"
                    />
                  </label>
                </div>

                <div className="space-y-3">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-900 mb-2 block">
                      National ID
                    </span>
                    <input
                      type="text"
                      placeholder="National ID number"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3399FF]/20 focus:border-[#3399FF] transition-all"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-300"></div>

            {/* Submit Section */}
            <div className="pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">
                    {existingShop ? "Update Your Shop" : "Ready to Launch?"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {existingShop
                      ? "Review your changes before updating"
                      : "Your shop will be active immediately"}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="group relative px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px]"
                >
                  <div className="absolute inset-0 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#3399FF] to-[#8B5CF6] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="relative flex items-center justify-center gap-2">
                    {formLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        {existingShop ? "Update Shop" : "Create Shop"}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Benefits Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#3399FF]/10 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#3399FF]" />
            </div>
            <h3 className="font-medium text-gray-900">Global Reach</h3>
          </div>
          <p className="text-sm text-gray-600">
            Sell to customers worldwide with our platform
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-5 border border-gray-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#EF837B]/10 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#EF837B]" />
            </div>
            <h3 className="font-medium text-gray-900">Secure Platform</h3>
          </div>
          <p className="text-sm text-gray-600">
            Protected transactions and verified customers
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-5 border border-gray-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-900/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-gray-900" />
            </div>
            <h3 className="font-medium text-gray-900">Growth Tools</h3>
          </div>
          <p className="text-sm text-gray-600">
            Analytics and tools to grow your business
          </p>
        </div>
      </div>
    </div>
  );
}
