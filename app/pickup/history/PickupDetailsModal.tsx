import { Button } from "@/components/ui/button";
import { Pickup } from "@/utils/db/actions/pickups";
import {
  Calendar,
  CheckCircle,
  MapPin,
  Timer,
  Trash2,
  XCircle,
} from "lucide-react";

// ✅ Define PickupStatus type explicitly
type PickupStatus = "all" | "assigned" | "in_progress" | "completed";

// ✅ Define StatusConfig Type
type StatusConfig = {
  [key in PickupStatus]: {
    label: string;
    color: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
  };
};

const StatusBadge: React.FC<{ status: PickupStatus }> = ({ status }) => {
  // ✅ Define statusConfig with explicit type
  const statusConfig: StatusConfig = {
    all: {
      label: "All",
      color: "bg-gray-100 text-gray-700",
      icon: XCircle,
    },
    assigned: {
      label: "Assigned",
      color: "bg-blue-100 text-blue-700",
      icon: CheckCircle,
    },
    in_progress: {
      label: "In Progress",
      color: "bg-yellow-100 text-yellow-700",
      icon: Timer,
    },
    completed: {
      label: "Completed",
      color: "bg-green-100 text-green-700",
      icon: CheckCircle,
    },
  };

  // ✅ Destructure without error
  const { label, color, icon: Icon } = statusConfig[status];

  return (
    <span
      className={`flex items-center px-2 py-1 text-xs font-semibold rounded-full ${color}`}
    >
      <Icon className="w-4 h-4 mr-1" />
      {label}
    </span>
  );
};

interface ModalProps {
  pickup: Pickup;
  onClose: () => void;
}

const PickupDetailsModal: React.FC<ModalProps> = ({ pickup, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-96 relative transform transition-all duration-300 scale-100">
        {/* ❌ Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition-all"
        >
          <XCircle className="w-5 h-5" />
        </button>

        {/* ✅ Modal Header */}
        <h2 className="text-2xl font-bold text-green-700 mb-4">
          📦 Pickup Details
        </h2>

        {/* ✅ Pickup Info */}
        <div className="space-y-6">
          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar className="w-5 h-5 text-green-500" />
            <span className="font-medium">Date:</span>{" "}
            {new Date(pickup.updatedAt).toLocaleDateString()}
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <MapPin className="w-5 h-5 text-green-500" />
            <span className="font-medium">Location:</span> {pickup.location}
          </div>

          {/* Waste Type */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium">Waste Type:</span> {pickup.wasteType}
          </div>

          {/* Amount */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Trash2 className="w-5 h-5 text-green-500" />
            <span className="font-medium">Amount:</span> {pickup.amount}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <StatusBadge status={pickup.status as PickupStatus} />
          </div>
        </div>

        {/* ✅ Divider */}
        <div className="border-t my-6"></div>

        {/* ✅ Modal Footer */}
        <div className="flex justify-end">
          <Button
            onClick={onClose}
            className="w-full bg-green-600 text-white hover:bg-green-700 transition-all"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PickupDetailsModal;
