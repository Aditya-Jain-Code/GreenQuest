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
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPickupDetails,
  updatePickupStatus,
} from "@/utils/db/actions/pickups";
import { toast } from "react-hot-toast";

type PickupStatus = "assigned" | "in_progress" | "completed" | "cancelled";

type PickupDetails = {
  id: number;
  location: string;
  wasteType: string;
  amount: string;
  status: PickupStatus;
  updatedAt: Date;
};

export default function PickupDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [pickup, setPickup] = useState<PickupDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const agentEmail = localStorage.getItem("agentEmail");
        if (!agentEmail) {
          toast.error("User not found. Please log in again.");
          router.push("/pickup/login");
          return;
        }

        const data = await getPickupDetails(Number(id));
        const validStatuses: PickupStatus[] = [
          "assigned",
          "in_progress",
          "completed",
          "cancelled",
        ];
        if (validStatuses.includes(data.status as PickupStatus)) {
          setPickup({ ...data, status: data.status as PickupStatus });
        } else {
          toast.error("Invalid status value.");
        }
      } catch (error) {
        toast.error("Error loading pickup details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleUpdateStatus = async (newStatus: PickupStatus) => {
    if (!pickup) return;
    setUpdating(true);
    try {
      await updatePickupStatus(pickup.id, newStatus);
      toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
      setPickup({ ...pickup, status: newStatus });
    } catch (error) {
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
    <div className="bg-gray-50 min-h-screen py-10 px-4 md:px-6 lg:px-10">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-6 md:p-8 border border-gray-200 space-y-6">
        {/* Back Button */}
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="text-muted-foreground hover:bg-gray-100 w-fit"
        >
          <ArrowLeft className="mr-2" size={18} />
          Back
        </Button>

        {/* Header */}
        <h2 className="text-3xl font-bold text-green-700 flex items-center gap-2">
          <Package size={28} /> Pickup Details
        </h2>

        {/* Info Fields */}
        <div className="space-y-4">
          <InfoRow
            label="Waste Type"
            value={pickup.wasteType}
            icon={<Package className="text-blue-600" />}
          />
          <InfoRow
            label="Location"
            value={pickup.location}
            icon={<MapPin className="text-red-500" />}
          />
          <InfoRow
            label="Amount"
            value={pickup.amount}
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
            icon={<CheckCircle className="text-green-600" />}
          />
        </div>

        {/* Action Buttons */}
        {pickup.status !== "completed" && pickup.status !== "cancelled" && (
          <div className="pt-4 flex flex-wrap gap-3">
            {pickup.status === "assigned" && (
              <Button
                onClick={() => handleUpdateStatus("in_progress")}
                disabled={updating}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium shadow-md"
              >
                ⏳ Start Pickup
              </Button>
            )}
            {pickup.status === "in_progress" && (
              <Button
                onClick={() => handleUpdateStatus("completed")}
                disabled={updating}
                className="bg-green-600 hover:bg-green-700 text-white font-medium shadow-md"
              >
                ✅ Mark as Completed
              </Button>
            )}
            <Button
              onClick={() => handleUpdateStatus("cancelled")}
              disabled={updating}
              className="bg-red-500 hover:bg-red-600 text-white font-medium shadow-md"
            >
              <XCircle className="mr-2" size={18} />
              Cancel Pickup
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable Info Row
interface InfoRowProps {
  label: string;
  value: string | JSX.Element;
  icon: JSX.Element;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon }) => (
  <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-sm">
    <div className="flex items-center gap-3">
      {icon}
      <h4 className="text-gray-700 font-medium">{label}</h4>
    </div>
    <div className="text-gray-900 font-semibold text-right">{value}</div>
  </div>
);

// Status badge
const StatusBadge: React.FC<{ status: PickupStatus }> = ({ status }) => {
  const colorMap: Record<PickupStatus, string> = {
    assigned: "bg-blue-600",
    in_progress: "bg-yellow-500",
    completed: "bg-green-600",
    cancelled: "bg-red-500",
  };

  return (
    <span
      className={`text-white text-xs font-semibold px-3 py-1 rounded-full shadow ${colorMap[status]}`}
    >
      {status.replace("_", " ").toUpperCase()}
    </span>
  );
};
