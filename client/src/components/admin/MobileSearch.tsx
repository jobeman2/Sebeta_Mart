"use client";

import { Search } from "lucide-react";

interface MobileSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
}

export function MobileSearch({
  searchQuery,
  setSearchQuery,
  placeholder = "Search...",
}: MobileSearchProps) {
  return (
    <div className="md:hidden mb-6">
      <div className="flex items-center bg-gray-50 rounded-lg px-4 py-3">
        <Search className="w-4 h-4 text-gray-400 mr-3" />
        <input
          type="text"
          placeholder={placeholder}
          className="bg-transparent border-none outline-none text-sm flex-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
}
