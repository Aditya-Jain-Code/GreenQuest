"use client";

import { useEffect, useState } from "react";
import {
  getAllRewards,
  createReward,
  updateRewardPoints,
  deleteReward,
} from "@/utils/db/actions/rewards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { Edit, Trash2, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { getUserByEmail } from "@/utils/db/actions/users";

interface Reward {
  id: number;
  userId: number;
  name: string;
  points: number;
  level: number;
  description: string | null;
  collectionInfo: string;
  isAvailable: boolean;
  createdAt: Date;
  userName?: string | null; // Added for displaying user name
}

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newReward, setNewReward] = useState({
    userId: 0,
    name: "",
    points: 0,
    description: "",
    collectionInfo: "",
  });
  const [authorized, setAuthorized] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const adminEmail = localStorage.getItem("adminEmail");
        if (!adminEmail) {
          router.push("/not-authorized"); // Redirect if no user
          return;
        }

        const user = await getUserByEmail(adminEmail);
        if (user?.role !== "admin") {
          router.push("/not-authorized"); // Redirect if not admin
          return;
        }

        setAuthorized(true); // Allow if admin
      } catch (error) {
        console.error("❌ Error verifying user role:", error);
        router.push("/not-authorized"); // Redirect on error
      }
    };

    checkUserRole();
  }, [router]);

  // 🔥 Fetch rewards on page load
  useEffect(() => {
    async function fetchRewards() {
      try {
        const data = await getAllRewards(); // Updated to get userName
        setRewards(data);
      } catch (error) {
        console.error("Error fetching rewards:", error);
        toast.error("Failed to load rewards.");
      }
    }

    if (authorized) {
      fetchRewards();
    }
  }, [authorized]);

  // 📝 Handle input changes for reward form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewReward({ ...newReward, [name]: value });
  };

  // ✅ Add or Update Reward
  const handleSaveReward = async () => {
    try {
      if (isEditMode && selectedReward) {
        // Update reward points using `updateRewardPoints()`
        await updateRewardPoints(selectedReward.userId, newReward.points);
        toast.success("Reward updated successfully!");
      } else {
        // Create a new reward using `createReward()`
        await createReward(newReward.userId, newReward.points);
        toast.success("Reward added successfully!");
      }
      refreshRewards();
      closeDialog();
    } catch (error) {
      console.error("Error saving reward:", error);
      toast.error("Failed to save reward.");
    }
  };

  // ❌ Delete Reward
  const handleDeleteReward = async (rewardId: number) => {
    if (!confirm("Are you sure you want to delete this reward?")) return;
    try {
      await deleteReward(rewardId);
      toast.success("Reward deleted successfully!");
      refreshRewards();
    } catch (error) {
      console.error("Error deleting reward:", error);
      toast.error("Failed to delete reward.");
    }
  };

  // 🔄 Refresh rewards after CRUD actions
  const refreshRewards = async () => {
    const data = await getAllRewards();
    setRewards(data);
  };

  // 🔍 Open edit dialog with reward data
  const openEditDialog = (reward: Reward) => {
    setSelectedReward(reward);
    setNewReward({
      userId: reward.userId,
      name: reward.name,
      points: reward.points,
      description: reward.description || "",
      collectionInfo: reward.collectionInfo,
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // ➕ Open create dialog
  const openCreateDialog = () => {
    setSelectedReward(null);
    setNewReward({
      userId: 0,
      name: "",
      points: 0,
      description: "",
      collectionInfo: "",
    });
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  // ❌ Close dialog
  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedReward(null);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-green-700">
        🎁 Rewards Management
      </h1>

      {/* Add Reward Button */}
      <Button
        onClick={openCreateDialog}
        className="mb-4 bg-green-500 text-white flex items-center gap-2"
      >
        <PlusCircle size={18} />
        Add New Reward
      </Button>

      {/* Rewards Table */}
      <Table className="w-full bg-white shadow-md rounded-lg">
        <TableHeader>
          <TableRow>
            <TableCell className="font-bold">ID</TableCell>
            <TableCell className="font-bold">User</TableCell>
            <TableCell className="font-bold">Name</TableCell>
            <TableCell className="font-bold">Points</TableCell>
            <TableCell className="font-bold">Level</TableCell>
            <TableCell className="font-bold">Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rewards.map((reward) => (
            <TableRow key={reward.id} className="hover:bg-gray-50">
              <TableCell>{reward.id}</TableCell>
              <TableCell>{reward.userName || "Unknown"}</TableCell>
              <TableCell>{reward.name}</TableCell>
              <TableCell>{reward.points} points</TableCell>
              <TableCell>{reward.level}</TableCell>
              <TableCell className="flex space-x-2">
                <Button
                  onClick={() => openEditDialog(reward)}
                  className="bg-blue-500 text-white px-3 py-1"
                >
                  <Edit size={18} />
                </Button>
                <Button
                  onClick={() => handleDeleteReward(reward.id)}
                  className="bg-red-500 text-white px-3 py-1"
                >
                  <Trash2 size={18} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add/Edit Reward Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Reward" : "Add New Reward"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="number"
              label="User ID"
              name="userId"
              value={newReward.userId}
              onChange={handleInputChange}
              placeholder="Enter user ID"
            />
            <Input
              label="Reward Name"
              name="name"
              value={newReward.name}
              onChange={handleInputChange}
              placeholder="Enter reward name"
            />
            <Input
              type="number"
              label="Points (Reward Cost)"
              name="points"
              value={newReward.points}
              onChange={handleInputChange}
              placeholder="Enter points for reward"
            />
            <Input
              label="Collection Info"
              name="collectionInfo"
              value={newReward.collectionInfo}
              onChange={handleInputChange}
              placeholder="Collection instructions"
            />
            <Input
              label="Description"
              name="description"
              value={newReward.description || ""}
              onChange={handleInputChange}
              placeholder="Enter reward description"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSaveReward} className="bg-green-500">
              {isEditMode ? "Update Reward" : "Add Reward"}
            </Button>
            <Button onClick={closeDialog} className="bg-gray-500">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
