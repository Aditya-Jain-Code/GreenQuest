"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  MapPin,
  Trash2,
  Scale,
  RefreshCw,
  CheckCircle,
  Clock,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAssignedPickups } from "@/utils/db/actions/pickups";
import toast from "react-hot-toast";

type Pickup = {
  id: number;
  location: string;
  status: "assigned" | "in_progress" | "completed";
  wasteType: string;
  amount: string;
};

export default function PickupDashboard() {
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const router = useRouter();

  const fetchPickups = async () => {
    try {
      const agentEmail = localStorage.getItem("agentEmail");
      if (!agentEmail) {
        toast.error("User not found. Please log in again.");
        router.push("/pickup/login");
        return;
      }

      const data = (await getAssignedPickups(agentEmail || "")) as Pickup[];
      setPickups(data);
    } catch (error) {
      console.error("Error fetching pickups:", error);
      toast.error("Failed to load pickups.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPickups();
  };

  const handleViewDetails = (id: number) => {
    router.push(`/pickup/details/${id}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-gray-50">
        <Loader2 className="animate-spin text-green-600" size={48} />
        <p className="mt-4 text-lg text-gray-600">Loading your pickups...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-gradient-to-b from-white to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
              🚛 Your Assigned Pickups
            </h1>
            <p className="text-gray-600">
              {pickups.length} {pickups.length === 1 ? "pickup" : "pickups"}{" "}
              assigned to you.
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="gap-2 px-5 py-2 border border-green-500 text-green-600 hover:bg-green-100"
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>

        {/* Empty State */}
        {pickups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-xl bg-white shadow-lg border border-gray-200">
            <img
              src="/empty-state.svg"
              alt="No pickups"
              className="w-64 h-64 mb-6"
            />
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              No pickups assigned
            </h3>
            <p className="text-gray-600 mb-6 max-w-md text-center">
              You currently don't have any pickups assigned. Check back later or
              refresh to see new assignments.
            </p>
            <Button onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Refreshing...
                </>
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pickups.map((pickup) => (
              <div
                key={pickup.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-200 flex flex-col h-full transform hover:scale-105"
              >
                <div className="p-5 flex-1 flex flex-col justify-between">
                  {/* Location & Status */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-green-100 rounded-lg">
                        <MapPin className="text-green-600" size={20} />
                      </div>
                      {/* ✅ Truncated location before comma */}
                      <h2 className="text-md font-bold text-gray-800 line-clamp-1">
                        {pickup.location.split(",")[0]}...
                      </h2>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        pickup.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : pickup.status === "in_progress"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      } whitespace-nowrap`}
                    >
                      {pickup.status === "completed" && (
                        <CheckCircle size={14} className="text-green-700" />
                      )}
                      {pickup.status === "in_progress" && (
                        <Clock size={14} className="text-amber-700" />
                      )}
                      {pickup.status === "assigned" && (
                        <Package size={14} className="text-blue-700" />
                      )}
                      {pickup.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Waste Info - Consistent Height & Alignment */}
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-red-100 rounded-lg">
                        <Trash2 className="text-red-500" size={16} />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-xs text-gray-500">Waste Type</p>
                        <p className="font-medium text-gray-800 leading-tight">
                          {pickup.wasteType.length > 45
                            ? `${pickup.wasteType.slice(0, 45)}...`
                            : pickup.wasteType}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-100 rounded-lg">
                        <Scale className="text-blue-500" size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="font-medium text-gray-800">
                          {pickup.amount}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Button Section */}
                <div className="px-5 pb-5">
                  <Button
                    onClick={() => handleViewDetails(pickup.id)}
                    className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-600 hover:to-green-800 shadow-lg transform hover:scale-105 transition-all duration-300 rounded-lg py-2"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
