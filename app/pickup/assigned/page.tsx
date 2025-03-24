"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAssignedPickups } from "@/utils/db/actions/pickups";

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
  const router = useRouter();

  useEffect(() => {
    const fetchPickups = async () => {
      try {
        const agentEmail = localStorage.getItem("userEmail");
        const data = (await getAssignedPickups(agentEmail || "")) as Pickup[];
        setPickups(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching pickups:", error);
        setLoading(false);
      }
    };

    fetchPickups();
  }, []);

  const handleViewDetails = (id: number) => {
    router.push(`/pickup/details/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-green-700 mb-6">
        🚛 Pickup Agent Dashboard
      </h1>

      {pickups.length === 0 ? (
        <p className="text-lg text-gray-600">No pickups assigned yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pickups.map((pickup) => (
            <div
              key={pickup.id}
              className="bg-white shadow-md rounded-xl p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  📍 {pickup.location}
                </h2>
                <div
                  className={`text-sm px-3 py-1 rounded-full ${
                    pickup.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : pickup.status === "in_progress"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {pickup.status === "completed"
                    ? "✅ Completed"
                    : pickup.status === "in_progress"
                    ? "⏳ In Progress"
                    : "📦 Assigned"}
                </div>
              </div>
              <p className="text-gray-600">
                🗑️ {pickup.wasteType} | ⚖️ {pickup.amount} kg
              </p>
              <Button
                onClick={() => handleViewDetails(pickup.id)}
                className="mt-4 w-full bg-green-600 text-white hover:bg-green-700"
              >
                View Details
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
