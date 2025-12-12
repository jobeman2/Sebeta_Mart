"use client";

import { ShieldCheck, Users, Shield } from "lucide-react";

interface UserCardProps {
  userFullName: string;
  userInitial: string;
  roleDisplayName: string;
  userRole: "admin" | "city-clerk";
  roleColor: string;
  stats: {
    totalSellers: number;
    totalBuyers: number;
    cityClerks: number;
    activeTransactions: number;
  };
}

export default function UserCard({ 
  userFullName, 
  userInitial, 
  roleDisplayName, 
  userRole, 
  roleColor,
  stats
}: UserCardProps) {
  return (
    <div className={`bg-gradient-to-br ${roleColor} rounded-2xl p-6 text-white`}>
      <div className="flex items-center mb-6">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
          {userInitial}
        </div>
        <div className="ml-4">
          <h3 className="text-xl font-bold">{userFullName}</h3>
          <div className="flex items-center mt-1">
            <span className="text-blue-200">{roleDisplayName}</span>
            {userRole === "admin" && (
              <Shield className="w-4 h-4 ml-2 text-white/70" />
            )}
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center">
          <ShieldCheck className="w-4 h-4 mr-2" />
          <span className="text-sm">
            {userRole === "admin" ? "Full System Access" : "Document Verification Access"}
          </span>
        </div>
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-2" />
          <span className="text-sm">
            {userRole === "admin" 
              ? `Manages ${stats.totalSellers + stats.totalBuyers + stats.cityClerks} users`
              : `Verified ${stats.activeTransactions} documents this week`
            }
          </span>
        </div>
      </div>
      <button className="w-full mt-6 px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors font-medium">
        View Full Profile
      </button>
    </div>
  );
}