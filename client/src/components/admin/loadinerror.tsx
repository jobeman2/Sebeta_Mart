"use client";

import { AlertCircle, Shield, RefreshCw } from "lucide-react";

interface LoadingErrorProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function LoadingError({ loading, error, onRetry }: LoadingErrorProps) {
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md p-6 bg-white rounded-xl border border-gray-200">
          <AlertCircle className="w-12 h-12 text-[#EF837B] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-4 text-sm">{error}</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors text-sm flex items-center justify-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return null;
}
