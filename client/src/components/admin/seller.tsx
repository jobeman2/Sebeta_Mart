"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  Edit,
  MoreVertical,
  XCircle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Dialog } from "@headlessui/react";
import { useAuth } from "@/context/Authcontext"; // your auth context
import axios from "axios";

interface Seller {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone_number: string;
  is_verified: boolean;
  shop_name: string;
  shop_description: string;
  shop_address: string;
  business_license: string | null;
  government_id: string | null;
  national_id_number: string;
}

const StatusBadge = ({
  status,
}: {
  status: "active" | "pending" | "suspended";
}) => {
  const styles = {
    active: "bg-green-100 text-green-800 border-green-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    suspended: "bg-red-100 text-red-800 border-red-200",
  };

  const icons = {
    active: <CheckCircle className="w-3 h-3" />,
    pending: <AlertCircle className="w-3 h-3" />,
    suspended: <XCircle className="w-3 h-3" />,
  };

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${styles[status]}`}
    >
      {icons[status]} <span className="capitalize">{status}</span>
    </div>
  );
};

export default function SellersPage() {
  const { user, token } = useAuth();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "pending" | "suspended"
  >("all");
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/sellers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSellers(res.data.sellers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (seller: Seller) =>
    seller.is_verified ? "active" : "pending";

  const filteredSellers = sellers.filter((seller) => {
    const matchesSearch =
      seller.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.phone_number.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || getStatus(seller) === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredSellers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSellers = filteredSellers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const openModal = (seller: Seller) => {
    setSelectedSeller(seller);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedSeller(null);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <h1 className="text-2xl font-bold mb-4">Sellers</h1>

      {/* Search + Status Filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search sellers..."
          className="px-4 py-2 border rounded-lg flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {["all", "active", "pending", "suspended"].map((status) => (
          <button
            key={status}
            className={`px-4 py-2 rounded-lg ${
              statusFilter === status
                ? "bg-black text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => setStatusFilter(status as any)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-4 border-b">Name</th>
                <th className="p-4 border-b">Email</th>
                <th className="p-4 border-b">Phone</th>
                <th className="p-4 border-b">Status</th>
                <th className="p-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentSellers.map((seller) => (
                <tr key={seller.id} className="hover:bg-gray-50">
                  <td className="p-4">{seller.full_name}</td>
                  <td className="p-4">{seller.email}</td>
                  <td className="p-4">{seller.phone_number}</td>
                  <td className="p-4">
                    <StatusBadge status={getStatus(seller)} />
                  </td>
                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => openModal(seller)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {["admin", "super_admin"].includes(user.role) && (
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <p>
          Showing {startIndex + 1} to{" "}
          {Math.min(startIndex + itemsPerPage, filteredSellers.length)} of{" "}
          {filteredSellers.length}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 border rounded-lg disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* View Modal */}
      <Dialog open={isModalOpen} onClose={closeModal} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-md">
            <Dialog.Title className="text-xl font-bold mb-4">
              Seller Details
            </Dialog.Title>
            {selectedSeller && (
              <div className="space-y-2">
                <p>
                  <strong>Name:</strong> {selectedSeller.full_name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedSeller.email}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedSeller.phone_number}
                </p>
                <p>
                  <strong>Shop:</strong> {selectedSeller.shop_name}
                </p>
                <p>
                  <strong>Address:</strong> {selectedSeller.shop_address}
                </p>
                <p>
                  <strong>Status:</strong> {getStatus(selectedSeller)}
                </p>
                {user.role !== "city-clerk" && (
                  <>
                    <p>
                      <strong>Business License:</strong>{" "}
                      {selectedSeller.business_license}
                    </p>
                    <p>
                      <strong>Government ID:</strong>{" "}
                      {selectedSeller.government_id}
                    </p>
                  </>
                )}
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-100 rounded-lg"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
