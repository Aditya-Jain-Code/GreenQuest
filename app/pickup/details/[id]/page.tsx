"use client";

import { useState, useEffect, JSX } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  MapPin,
  Package,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Clock,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPickupDetails,
  updatePickupStatus,
} from "@/utils/db/actions/pickups";
import { toast } from "react-hot-toast";

type PickupDetails = {
  id: number;
  location: string;
  wasteType: string;
  amount: string;
  status: "assigned" | "in_progress" | "completed";
  updatedAt: Date;
};

export default function PickupDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [pickup, setPickup] = useState<PickupDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getPickupDetails(Number(id));

        // Type assertion to restrict the status to valid types
        if (
          data.status === "assigned" ||
          data.status === "in_progress" ||
          data.status === "completed"
        ) {
          setPickup({
            ...data,
            status: data.status as "assigned" | "in_progress" | "completed",
          });
        } else {
          console.error("Invalid status value:", data.status);
          toast.error("Invalid status value.");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching pickup details:", error);
        toast.error("Error loading pickup details.");
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleUpdateStatus = async (
    newStatus: "assigned" | "in_progress" | "completed"
  ) => {
    if (!pickup) return;

    setUpdating(true);
    try {
      await updatePickupStatus(pickup.id, newStatus);
      toast.success(`Pickup marked as ${newStatus}`);
      setPickup({ ...pickup, status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  if (!pickup) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-500">Pickup not found!</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4 md:px-6 lg:px-10">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-8 border border-gray-200">
        {/* Back Button */}
        <Button
          onClick={() => router.back()}
          className="bg-gray-600 text-white hover:bg-gray-700 mb-6 flex items-center"
        >
          <ArrowLeft className="mr-2" size={18} />
          Back to Pickups
        </Button>

        {/* Pickup Header */}
        <h1 className="text-3xl font-bold text-green-700 mb-6 flex items-center space-x-2">
          <Package className="text-green-600" size={32} />
          <span>Pickup Details</span>
        </h1>

        {/* Pickup Info */}
        <div className="space-y-6">
          <InfoRow
            label="Waste Type"
            value={pickup.wasteType}
            icon={<Package className="text-blue-500" />}
          />
          <InfoRow
            label="Location"
            value={pickup.location}
            icon={<MapPin className="text-red-500" />}
          />
          <InfoRow
            label="Amount"
            value={`${pickup.amount}`}
            icon={<Info className="text-indigo-500" />}
          />
          <InfoRow
            label="Last Updated"
            value={new Date(pickup.updatedAt).toLocaleString()}
            icon={<Clock className="text-orange-500" />}
          />
          <InfoRow
            label="Status"
            value={<StatusBadge status={pickup.status} />}
            icon={<CheckCircle className="text-green-500" />}
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4 justify-start">
          {pickup.status === "assigned" && (
            <Button
              onClick={() => handleUpdateStatus("in_progress")}
              disabled={updating}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center"
            >
              ⏳ Mark as In Progress
            </Button>
          )}
          {pickup.status === "in_progress" && (
            <Button
              onClick={() => handleUpdateStatus("completed")}
              disabled={updating}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center"
            >
              ✅ Mark as Completed
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Info Row Component
interface InfoRowProps {
  label: string;
  value: string | JSX.Element;
  icon: JSX.Element;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon }) => (
  <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm">
    <div className="flex items-center space-x-3">
      {icon}
      <h3 className="text-lg font-medium text-gray-700">{label}</h3>
    </div>
    <p className="text-lg font-semibold text-gray-900">{value}</p>
  </div>
);

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusColors: { [key: string]: string } = {
    assigned: "bg-blue-600",
    in_progress: "bg-yellow-500",
    completed: "bg-green-600",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-white ${statusColors[status]}`}
    >
      {status.replace("_", " ").toUpperCase()}
    </span>
  );
};
