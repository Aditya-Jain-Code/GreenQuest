// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { getAllRewards, deleteReward } from "@/utils/db/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash } from "lucide-react";

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [deleteRewardId, setDeleteRewardId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch Rewards on Page Load
  useEffect(() => {
    async function fetchRewards() {
      const fetchedRewards = await getAllRewards();
      setRewards(fetchedRewards);
    }
    fetchRewards();
  }, []);

  // Open Delete Confirmation Dialog
  const confirmDelete = (rewardId: number) => {
    setDeleteRewardId(rewardId);
    setIsDialogOpen(true);
  };

  // Handle Reward Deletion
  const handleDelete = async () => {
    if (!deleteRewardId) return;

    const result = await deleteReward(deleteRewardId);
    if (result.success) {
      toast.success("Reward deleted successfully!");
      setRewards((prevRewards) =>
        prevRewards.filter((reward) => reward.id !== deleteRewardId)
      );
    } else {
      toast.error("Failed to delete reward.");
    }

    setIsDialogOpen(false);
    setDeleteRewardId(null);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Manage Rewards</h1>

      <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-left">Name</th>
            <th className="p-4 text-left">Points</th>
            <th className="p-4 text-left">Level</th>
            <th className="p-4 text-left">Description</th>
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rewards.length > 0 ? (
            rewards.map((reward) => (
              <tr key={reward.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{reward.name}</td>
                <td className="p-4">{reward.points}</td>
                <td className="p-4">{reward.level}</td>
                <td className="p-4">{reward.description}</td>
                <td className="p-4">
                  <div className="flex justify-center">
                    <Button
                      variant="destructive"
                      onClick={() => confirmDelete(reward.id)}
                      className="bg-red-600 hover:bg-red-700 text-white flex items-center"
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">
                No rewards found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Reward Deletion</DialogTitle>
            <p className="text-gray-600">
              Are you sure you want to delete this reward? This action cannot be
              undone.
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
