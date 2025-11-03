"use client";

import { useState } from "react";
import { User } from "lucide-react";
import SocialButtons from "./SocialButtons";

export default function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("buyer"); // default role
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
          phone_number: phone, // match your backend column
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Show first error or generic message
        setError(data.msg || data.errors?.[0]?.msg || "Registration failed");
      } else {
        setSuccess("Registration successful! You can now log in.");
        // Reset form
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
      {/* Title + Description */}
      <div className="mb-4 font-dm-sans">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-6 h-6 text-[#3399FF]" />
          <h3 className="text-2xl font-bold">Create Your Account</h3>
        </div>
        <p className="text-gray-500 text-sm">
          Fill in the information below to get started
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-dm-sans">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
            className="w-full border border-gray-300 px-4 py-2 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+251 9XXXXXXXX"
            className="w-full border border-gray-300 px-4 py-2 rounded-lg"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="w-full border border-gray-300 px-4 py-2 rounded-lg"
          required
        />
      </div>

      {/* Password */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full border border-gray-300 px-4 py-2 rounded-lg"
          required
        />
      </div>

      {/* Confirm Password */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-600 mb-1">Confirm Password</label>
        <input
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full border border-gray-300 px-4 py-2 rounded-lg"
          required
        />
      </div>

      {/* Role chooser */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border border-gray-300 px-4 py-2 rounded-lg"
          required
        >
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
        </select>
      </div>

      {/* Error / Success */}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#3399FF] text-white py-3 rounded-lg"
      >
        {loading ? "Registering..." : "Create Account"}
      </button>

      {/* Separator */}
      <div className="flex items-center my-4">
        <hr className="flex-1 border-gray-300" />
        <span className="mx-3 text-gray-400 text-sm">OR</span>
        <hr className="flex-1 border-gray-300" />
      </div>

      {/* Social Buttons */}
      <SocialButtons />
    </form>
  );
}
