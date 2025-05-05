"use client";

import { useState, useEffect, JSX } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Truck, CheckCircle, LogOut, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAgentProfile, logoutAgent } from "@/utils/db/actions/agents";
import { toast } from "react-hot-toast";

type AgentProfile = {
  id: number;
  name: string;
  email: string;
  completedPickups: number;
  pendingPickups: number;
  assignedPickups: {
    id: number;
    location: string;
    wasteType: string;
    status: "assigned" | "in_progress" | "completed";
  }[];
};

export default function PickupAgentProfilePage() {
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const agentEmail = localStorage.getItem("agentEmail");
    if (!agentEmail) {
      toast.error("User not found. Please log in again.");
      router.push("/pickup/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = (await getAgentProfile()) as AgentProfile;
        setAgent(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching agent profile:", error);
        toast.error("Error loading profile.");
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await logoutAgent();
    router.push("/pickup/login");
    toast.success("Logged out successfully!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">⏳ Loading profile...</p>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-500">Agent profile not found!</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4 md:px-6 lg:px-10">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 border border-gray-200">
        {/* Profile Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-green-700 flex items-center space-x-2">
            <User className="text-green-600" size={28} />
            <span>Agent Profile</span>
          </h1>
          <Button
            onClick={handleLogout}
            className="bg-red-600 text-white hover:bg-red-700 flex items-center px-4 py-2"
          >
            <LogOut className="mr-2" size={18} />
            Logout
          </Button>
        </div>

        {/* Agent Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <InfoCard label="Name" value={agent.name} icon={<User />} />
          <InfoCard label="Email" value={agent.email} icon={<Mail />} />
        </div>

        {/* Pickup Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard
            label="Completed Pickups"
            value={agent.completedPickups}
            icon={<CheckCircle className="text-green-500" />}
          />
          <StatCard
            label="In Progress Pickups"
            value={agent.pendingPickups}
            icon={<Truck className="text-yellow-500" />}
          />
        </div>

        {/* Assigned Pickups Table */}
        <div className="mt-8">
          <h2 className="text-xl font-medium text-gray-700 mb-4">
            🚚 Assigned Pickups
          </h2>
          {agent.assignedPickups.length === 0 ? (
            <p className="text-gray-500">No assigned pickups available.</p>
          ) : (
            <div className="bg-gray-50 rounded-lg shadow overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-200 text-gray-700">
                  <tr>
                    <th className="p-4">Location</th>
                    <th className="p-4">Waste Type</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {agent.assignedPickups.map((pickup) => (
                    <tr
                      key={pickup.id}
                      className="hover:bg-gray-100 transition"
                    >
                      <td className="p-4">{pickup.location}</td>
                      <td className="p-4">{pickup.wasteType}</td>
                      <td className="p-4">
                        <StatusBadge status={pickup.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Info Card Component
interface InfoCardProps {
  label: string;
  value: string;
  icon: JSX.Element;
}

const InfoCard: React.FC<InfoCardProps> = ({ label, value, icon }) => (
  <div className="bg-gray-50 p-6 rounded-lg shadow flex items-center space-x-4">
    {icon}
    <div>
      <h3 className="text-sm font-medium text-gray-500">{label}</h3>
      <p className="text-lg font-semibold text-gray-700">{value}</p>
    </div>
  </div>
);

// Stat Card Component
interface StatCardProps {
  label: string;
  value: number;
  icon: JSX.Element;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4 border border-gray-200">
    {icon}
    <div>
      <h3 className="text-sm font-medium text-gray-500">{label}</h3>
      <p className="text-lg font-semibold text-gray-700">{value}</p>
    </div>
  </div>
);

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusColors: { [key: string]: string } = {
    assigned: "bg-blue-100 text-blue-700",
    in_progress: "bg-yellow-100 text-yellow-700",
    completed: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}
    >
      {status.replace("_", " ").toUpperCase()}
    </span>
  );
};
