"use client";

import React, { useState, useEffect, JSX } from "react";
import { getPickupHistory } from "@/utils/db/actions/pickups";
import {
  Loader2,
  Eye,
  Calendar,
  MapPin,
  CheckCircle,
  Timer,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import PickupDetailsModal from "./PickupDetailsModal";
import { Pickup, PickupStatus } from "@/utils/db/actions/pickups";

// Status options with icons
const statusOptions: {
  label: string;
  value: PickupStatus;
  icon: JSX.Element;
}[] = [
  {
    label: "All Statuses",
    value: "all",
    icon: <XCircle className="w-4 h-4 mr-1" />,
  },
  {
    label: "Assigned",
    value: "assigned",
    icon: <Eye className="w-4 h-4 mr-1 text-blue-600" />,
  },
  {
    label: "In Progress",
    value: "in_progress",
    icon: <Timer className="w-4 h-4 mr-1 text-yellow-500" />,
  },
  {
    label: "Completed",
    value: "completed",
    icon: <CheckCircle className="w-4 h-4 mr-1 text-green-600" />,
  },
  {
    label: "Cancelled",
    value: "cancelled",
    icon: <XCircle className="w-4 h-4 mr-1 text-red-600" />,
  },
];

const PickupHistoryPage: React.FC = () => {
  const [pickupHistory, setPickupHistory] = useState<Pickup[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<PickupStatus>("all");
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Fetch pickup history on page load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const agentEmail = localStorage.getItem("agentEmail");
        const history = await getPickupHistory(agentEmail as string);
        setPickupHistory(history);
        setFilteredHistory(history);
      } catch (error) {
        console.error("Error fetching pickup history:", error);
        setError("Failed to load pickup history. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and Search Logic
  useEffect(() => {
    let filteredData = pickupHistory;

    if (statusFilter !== "all") {
      filteredData = filteredData.filter(
        (pickup) => pickup.status === statusFilter
      );
    }

    if (searchTerm) {
      filteredData = filteredData.filter(
        (pickup) =>
          pickup.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pickup.wasteType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredHistory(filteredData);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, pickupHistory]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  // Handle Modal Open/Close
  const handleViewDetails = (pickup: Pickup) => setSelectedPickup(pickup);
  const closeModal = () => setSelectedPickup(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        <span className="ml-2 text-gray-700">Loading pickup history...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600 text-center mt-6">{error}</p>;
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-green-700 mb-6">
        🚛 Pickup History
      </h1>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <Input
          type="text"
          placeholder="🔍 Search by location or waste type"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:min-w-[300px] md:max-w-[500px] px-4 py-3 text-base placeholder-gray-500 min-w-0"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as PickupStatus)}
        >
          <SelectTrigger className="w-full md:w-1/3">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                <div className="flex items-center">
                  {status.icon}
                  {status.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-green-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Date
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Location
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Waste Type
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Amount (kg)
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((pickup) => (
              <tr
                key={pickup.id}
                className="hover:bg-green-50 transition-all duration-200 border-b border-gray-200"
              >
                <td className="px-6 py-4 text-sm text-gray-700 align-middle">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {new Date(pickup.updatedAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 align-middle">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {pickup.location}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 align-middle">
                  {pickup.wasteType}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 align-middle">
                  {pickup.amount}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 align-middle">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                      pickup.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : pickup.status === "in_progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : pickup.status === "assigned"
                        ? "bg-blue-100 text-blue-700"
                        : pickup.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {pickup.status.replace("_", " ").toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 align-middle">
                  <Button
                    onClick={() => handleViewDetails(pickup)}
                    variant="secondary"
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {currentItems.length === 0 && (
          <div className="text-center text-gray-600 py-6">
            🚫 No pickups found for the selected criteria.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <Button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700"
        >
          Previous
        </Button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700"
        >
          Next
        </Button>
      </div>

      {/* Pickup Details Modal */}
      {selectedPickup && (
        <PickupDetailsModal pickup={selectedPickup} onClose={closeModal} />
      )}
    </div>
  );
};

export default PickupHistoryPage;
