"use client";

import { useState } from "react";
import { User, Mail, Lock, Phone, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import SocialButtons from "./SocialButtons";

export default function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("buyer");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!fullName || !email || !password || !confirmPassword || !phone || !role) {
      setError("Please fill all required fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
          role,
          phone_number: phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || data.errors?.[0]?.msg || "Registration failed");
      } else {
        setSuccess("Registration successful! You can now log in.");
        setFullName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setPhone("");
        setRole("buyer");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl mb-4 shadow-sm">
          <User className="w-8 h-8 text-[#3399FF]" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
        <p className="text-gray-500 text-sm">
          Join our community and get started today
        </p>
      </div>

      {/* Grid Layout for Name and Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Full Name
          </label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#3399FF] transition-colors" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3399FF]/30 focus:border-[#3399FF] transition-all duration-200 hover:border-gray-400 shadow-sm"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#3399FF] transition-colors" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+251 9XXXXXXXX"
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3399FF]/30 focus:border-[#3399FF] transition-all duration-200 hover:border-gray-400 shadow-sm"
              required
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Email Address
        </label>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#3399FF] transition-colors" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3399FF]/30 focus:border-[#3399FF] transition-all duration-200 hover:border-gray-400 shadow-sm"
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Password
        </label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#3399FF] transition-colors" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3399FF]/30 focus:border-[#3399FF] transition-all duration-200 hover:border-gray-400 shadow-sm"
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500">Minimum 6 characters</p>
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Confirm Password
        </label>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#3399FF] transition-colors" />
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3399FF]/30 focus:border-[#3399FF] transition-all duration-200 hover:border-gray-400 shadow-sm"
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Role Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Account Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {["buyer", "seller", "delivery"].map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setRole(r)}
              className={`px-4 py-3 rounded-xl border transition-all duration-200 ${
                role === r
                  ? "border-[#3399FF] bg-blue-50 text-[#3399FF] font-semibold"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
              }`}
              disabled={loading}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-start">
        <input
          type="checkbox"
          id="terms"
          className="w-4 h-4 text-[#3399FF] border-gray-300 rounded focus:ring-2 focus:ring-[#3399FF]/30 focus:ring-offset-0 mt-1"
          required
          disabled={loading}
        />
        <label htmlFor="terms" className="ml-3 text-sm text-gray-600">
          I agree to the{" "}
          <a href="#" className="text-[#3399FF] hover:text-blue-700 font-medium">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-[#3399FF] hover:text-blue-700 font-medium">
            Privacy Policy
          </a>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-green-600 text-sm font-medium">{success}</p>
            <a
              href="/login"
              className="text-green-700 hover:text-green-800 text-sm font-medium mt-1 inline-block"
            >
              Go to Login →
            </a>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#3399FF] to-blue-500 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating Account...
          </span>
        ) : (
          "Create Account"
        )}
      </button>

      {/* Separator */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white text-gray-500 text-sm font-medium">
            Or sign up with
          </span>
        </div>
      </div>

      {/* Social Buttons */}
      <SocialButtons />

      {/* Login Link */}
      <div className="pt-6 border-t border-gray-200">
        <p className="text-center text-gray-600 text-sm">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-[#3399FF] font-semibold hover:text-blue-700 transition-colors"
          >
            Sign in here
          </a>
        </p>
      </div>
    </form>
  );
}