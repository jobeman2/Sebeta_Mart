"use client";

import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import SocialButtons from "./SocialButtons";

interface Props {
  onSubmit: (data: { email: string; password: string }) => void;
}

export default function LoginForm({ onSubmit }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Title + Description */}
      <div className="mb-4 font-dm-sans">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-6 h-6 text-[#3399FF]" />
          <h3 className="text-2xl font-bold">Login to Your Account</h3>
        </div>
        <p className="text-gray-500 text-sm">
          Enter your email and password to continue
        </p>
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

      {/* Error */}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#3399FF] text-white py-3 rounded-lg"
      >
        {loading ? "Logging in..." : "Login"}
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
