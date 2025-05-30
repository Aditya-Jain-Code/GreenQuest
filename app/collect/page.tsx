"use client";

import { useState, useEffect, useRef } from "react";
import {
  Trash2,
  MapPin,
  CheckCircle,
  Clock,
  Calendar,
  Weight,
  Search,
  XCircle,
  Truck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { getWasteCollectionTasks } from "@/utils/db/actions/reports";
import { getUserByEmail } from "@/utils/db/actions/users";
import { useRouter } from "next/navigation";

type CollectionTask = {
  id: number;
  userId: number;
  location: string;
  wasteType: string;
  amount: string;
  status: "pending" | "assigned" | "completed" | "in_progress";
  date: string;
  collectorId: number | null;
};

const ITEMS_PER_PAGE = 5;

export default function CollectPage() {
  const router = useRouter();
  const toastShown = useRef(false);
  const [tasks, setTasks] = useState<CollectionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredWasteType, setHoveredWasteType] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState<{
    id: number;
    email: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    const fetchUserAndTasks = async () => {
      setLoading(true);
      try {
        const userEmail = localStorage.getItem("userEmail");
        if (userEmail) {
          const fetchedUser = await getUserByEmail(userEmail);
          if (fetchedUser) {
            setUser(fetchedUser);
          } else if (!toastShown.current) {
            toast.error("User not found. Please log in again.");
            toastShown.current = true;
            router.push("/login");
          }
        } else if (!toastShown.current) {
          toast.error("Please log in to view waste collection tasks.");
          toastShown.current = true;
          router.push("/login");
        }

        const fetchedTasks = await getWasteCollectionTasks();
        console.log("Fetched Tasks:", fetchedTasks);
        setTasks(fetchedTasks as CollectionTask[]);
      } catch (error) {
        console.error("Error fetching user and tasks:", error);
        toast.error("Failed to load user data and tasks. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndTasks();
  }, []);

  const filteredTasks = tasks
    .filter((task) => task.userId === user?.id)
    .filter((task) =>
      task.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Waste Collection Tasks
      </h1>

      <div className="mb-4 flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Search by area..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
          className="w-96"
        />
        <Button variant="outline" size="icon" className="shrink-0">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span>Loading...</span>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedTasks.length === 0 ? (
              <div className="text-center text-gray-600 py-10">
                No reports found.
              </div>
            ) : (
              paginatedTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-medium text-gray-800 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                      {task.location}
                    </h2>
                    <StatusBadge status={task.status} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-center relative">
                      <Trash2 className="w-4 h-4 mr-2 text-gray-500" />
                      <span
                        onMouseEnter={() => setHoveredWasteType(task.wasteType)}
                        onMouseLeave={() => setHoveredWasteType(null)}
                        className="cursor-pointer"
                      >
                        {task.wasteType.length > 8
                          ? `${task.wasteType.slice(0, 8)}...`
                          : task.wasteType}
                      </span>
                      {hoveredWasteType === task.wasteType && (
                        <div className="absolute left-0 top-full mt-1 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                          {task.wasteType}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center">
                      <Weight className="w-4 h-4 mr-2 text-gray-500" />
                      {task.amount}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      {task.date}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    {task.status === "completed" && (
                      <span className="text-green-600 text-sm font-medium">
                        Reward Earned
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {filteredTasks.length > 0 && (
            <div className="flex justify-center items-center mt-6 space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: CollectionTask["status"] }) {
  const statusConfig: Record<
    CollectionTask["status"] | string,
    { color: string; icon: any }
  > = {
    pending: {
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
    },
    assigned: {
      color: "bg-blue-100 text-blue-800",
      icon: Truck,
    },
    completed: {
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
    },
    in_progress: {
      color: "bg-orange-100 text-orange-800",
      icon: Calendar,
    },
    cancelled: {
      color: "bg-red-100 text-red-800",
      icon: XCircle,
    },
    unknown: {
      color: "bg-gray-100 text-gray-800",
      icon: Trash2,
    },
  };

  const { color, icon: Icon } = statusConfig[status] || statusConfig["unknown"];

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${color} flex items-center`}
    >
      <Icon className="mr-1 h-4 w-4" />
      {status?.replace("_", " ") || "Unknown"}
    </span>
  );
}
