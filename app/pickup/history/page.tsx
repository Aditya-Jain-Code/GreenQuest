"use client";

import { useState, useEffect } from "react";
import { getPickupHistory } from "@/utils/db/actions/pickups";
import { Loader2, CheckCircle, Clock, MapPin, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

// Type for pickup data
type Pickup = {
  id: number;
  location: string;
  wasteType: string;
  amount: string;
  status: "in_progress" | "completed";
  updatedAt: Date;
};

export default function PickupHistoryPage() {
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<"all" | "in_progress" | "completed">(
    "all"
  );
  const [agentEmail, setAgentEmail] = useState<string | null>(null);

  const router = useRouter();

  // ✅ UseEffect to fetch agentEmail from localStorage on client-side
  useEffect(() => {
    const storedEmail = localStorage.getItem("agentEmail");
    if (!storedEmail) {
      toast.error("Agent email not found. Redirecting to login...");
      router.push("/pickup/login");
    } else {
      setAgentEmail(storedEmail);
    }
  }, [router]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!agentEmail) return;

      try {
        const statusFilter =
          filter === "all"
            ? undefined
            : (filter as "in_progress" | "completed");

        // Fetch pickup history by agent email
        const data = (await getPickupHistory(
          agentEmail,
          statusFilter
        )) as Pickup[];
        setPickups(data);
      } catch (error) {
        console.error("Error fetching pickup history:", error);
        toast.error("Failed to load pickup history.");
      } finally {
        setLoading(false);
      }
    };

    if (agentEmail) {
      fetchHistory();
    }
  }, [filter, agentEmail]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8 px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6 border border-gray-200">
        {/* Page Header */}
        <h1 className="text-2xl font-bold text-green-700 mb-6">
          📚 Pickup History
        </h1>

        {/* Filter Tabs */}
        <div className="flex space-x-4 mb-6">
          {["all", "in_progress", "completed"].map((status) => (
            <Button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`${
                filter === status
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700"
              } px-4 py-2 rounded-lg`}
            >
              {status === "all"
                ? "All"
                : status === "in_progress"
                ? "In Progress"
                : "Completed"}
            </Button>
          ))}
        </div>

        {/* Pickup List */}
        {pickups.length === 0 ? (
          <p className="text-gray-500 text-center">No pickups found.</p>
        ) : (
          <div className="space-y-4">
            {pickups.map((pickup) => (
              <div
                key={pickup.id}
                className="bg-gray-50 p-4 rounded-lg shadow-sm border flex justify-between items-center"
              >
                <div className="flex items-center space-x-4">
                  <MapPin className="text-green-600" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      {pickup.location}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {pickup.wasteType} - {pickup.amount}
                    </p>
                    <p className="text-xs text-gray-400">
                      Last Updated:{" "}
                      {new Date(pickup.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-full text-white ${
                      pickup.status === "completed"
                        ? "bg-green-600"
                        : "bg-yellow-500"
                    }`}
                  >
                    {pickup.status === "completed"
                      ? "✅ Completed"
                      : "⏳ In Progress"}
                  </span>
                  <Button
                    onClick={() => router.push(`/pickup/${pickup.id}`)}
                    className="bg-blue-600 text-white hover:bg-blue-700"
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
