"use client";

import { useEffect, useState } from "react";
import {
  getAllPickupRequests,
  updatePickupStatus,
  assignCollector,
  unassignCollector,
} from "@/utils/db/actions/pickups";
import { getAllUsers } from "@/utils/db/actions/users";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "react-hot-toast";
import { Loader2, Trash2 } from "lucide-react";

interface PickupRequest {
  id: number;
  userId: number;
  location: string;
  wasteType: string;
  amount: string;
  imageUrl: string | null;
  status: string;
  createdAt: Date;
  collectorId: number | null;
}

interface User {
  id: number;
  name: string;
  role: string; // Updated to include roles properly
}

export default function PickupRequestsPage() {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [collectors, setCollectors] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ Fetch all pickup requests and available collectors/agents
  useEffect(() => {
    async function fetchData() {
      try {
        const [pickupData, userData] = await Promise.all([
          getAllPickupRequests(),
          getAllUsers(),
        ]);

        // ✅ Filter only 'agent' and 'collector' roles for assignment
        setCollectors(
          userData.filter(
            (user) => user.role === "collector" || user.role === "agent"
          )
        );
        setRequests(pickupData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // ✅ Handle assigning a collector/agent
  const handleAssignCollector = async (
    reportId: number,
    collectorId: number | null
  ) => {
    try {
      if (collectorId) {
        await assignCollector(reportId, collectorId);
        toast.success("Collector/Agent assigned successfully!");
      } else {
        await unassignCollector(reportId);
        toast.success("Collector/Agent unassigned successfully!");
      }
      refreshRequests();
    } catch (error) {
      console.error("Error assigning/unassigning collector/agent:", error);
      toast.error("Failed to assign/unassign collector/agent.");
    }
  };

  // ✅ Handle unassigning a collector/agent
  const handleUnassignCollector = async (reportId: number) => {
    try {
      await unassignCollector(reportId);
      toast.success("Collector/Agent unassigned successfully!");
      refreshRequests();
    } catch (error) {
      console.error("Error unassigning collector/agent:", error);
      toast.error("Failed to unassign collector/agent.");
    }
  };

  // ✅ Handle status update
  const handleStatusChange = async (reportId: number, newStatus: string) => {
    try {
      await updatePickupStatus(reportId, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      refreshRequests();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status.");
    }
  };

  // 🔄 Refresh pickup requests list
  const refreshRequests = async () => {
    const pickupData = await getAllPickupRequests();
    setRequests(pickupData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-green-700">
        🚛 Pickup Requests
      </h1>

      {/* Pickup Requests Table */}
      <Table className="w-full bg-white shadow-md rounded-lg">
        <TableHeader>
          <TableRow>
            <TableCell className="font-bold">ID</TableCell>
            <TableCell className="font-bold">Location</TableCell>
            <TableCell className="font-bold">Waste Type</TableCell>
            <TableCell className="font-bold">Amount</TableCell>
            <TableCell className="font-bold">Status</TableCell>
            <TableCell className="font-bold">Collector/Agent</TableCell>
            <TableCell className="font-bold">Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id} className="hover:bg-gray-50">
              <TableCell>{request.id}</TableCell>
              <TableCell>{request.location}</TableCell>
              <TableCell>{request.wasteType}</TableCell>
              <TableCell>{request.amount}</TableCell>

              {/* Status Dropdown */}
              <TableCell>
                <Select
                  value={request.status}
                  onValueChange={(value) =>
                    handleStatusChange(request.id, value)
                  }
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Change Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>

              {/* Assign Collector/Agent Dropdown */}
              <TableCell>
                <Select
                  value={
                    request.collectorId !== null
                      ? String(request.collectorId)
                      : "unassigned"
                  }
                  onValueChange={(value) =>
                    handleAssignCollector(
                      request.id,
                      value === "unassigned" ? null : parseInt(value)
                    )
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Assign Collector/Agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {collectors.map((collector) => (
                      <SelectItem
                        key={collector.id}
                        value={String(collector.id)}
                      >
                        {collector.name} ({collector.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>

              {/* Unassign Button */}
              <TableCell>
                {request.collectorId ? (
                  <Button
                    onClick={() => handleUnassignCollector(request.id)}
                    className="bg-red-500 text-white px-3 py-1"
                  >
                    <Trash2 size={18} />
                  </Button>
                ) : (
                  <Button
                    className="bg-gray-400 text-white px-3 py-1 cursor-not-allowed"
                    disabled
                  >
                    Unassigned
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
