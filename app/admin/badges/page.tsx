"use client";

import { useState, useEffect } from "react";
import BadgeTable from "./BadgeTable";
import {
  getAllBadges,
  createBadge,
  deleteBadge,
} from "@/utils/db/actions/badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";

// ✅ Updated Badge Interface
interface Badge {
  id: number;
  name: string;
  description: string;
  category: string;
  criteria: any;
  createdAt: string; // Keep createdAt as string for consistency
}

export default function BadgeManagementPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [newBadge, setNewBadge] = useState({
    name: "",
    description: "",
    category: "",
    criteria: {},
  });
  const [loading, setLoading] = useState<boolean>(false);

  // ✅ Fetch all badges on page load
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const allBadges = await getAllBadges();
        // ✅ Correctly format badges with createdAt as string
        const formattedBadges: Badge[] = allBadges.map((badge: any) => ({
          id: badge.id,
          name: badge.name,
          description: badge.description,
          category: badge.category,
          criteria: badge.criteria,
          createdAt: new Date(badge.createdAt).toISOString(),
        }));
        setBadges(formattedBadges);
      } catch (error) {
        toast.error("Error fetching badges!");
      }
    };
    fetchBadges();
  }, []);

  // ✅ Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewBadge({ ...newBadge, [name]: value });
  };

  // ✅ Add new badge with correct format
  const handleAddBadge = async () => {
    if (!newBadge.name || !newBadge.description || !newBadge.category) {
      toast.error("Please fill all the required fields.");
      return;
    }

    try {
      setLoading(true);
      const badge = await createBadge(
        newBadge.name,
        newBadge.description,
        newBadge.category,
        newBadge.criteria
      );

      // ✅ Correctly format the newly created badge
      const formattedBadge: Badge = {
        ...badge,
        createdAt: new Date(badge.createdAt).toISOString(),
      };

      // ✅ Add new badge to the list
      setBadges([...badges, formattedBadge]);
      setNewBadge({ name: "", description: "", category: "", criteria: {} });
      toast.success("Badge added successfully!");
    } catch (error) {
      toast.error("Error creating badge!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete badge
  const handleDeleteBadge = async (badgeId: number) => {
    try {
      await deleteBadge(badgeId);
      setBadges(badges.filter((badge) => badge.id !== badgeId));
      toast.success("Badge deleted successfully!");
    } catch (error) {
      toast.error("Error deleting badge!");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-green-700 mb-6">
        🏆 Manage Badges
      </h1>

      {/* Add New Badge Form */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">➕ Add New Badge</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="name"
            value={newBadge.name}
            onChange={handleInputChange}
            placeholder="Badge Name"
          />
          <Input
            name="category"
            value={newBadge.category}
            onChange={handleInputChange}
            placeholder="Category (e.g., Waste Collection, Recycling)"
          />
          <Textarea
            name="description"
            value={newBadge.description}
            onChange={handleInputChange}
            placeholder="Badge Description"
          />
        </div>
        <Button
          onClick={handleAddBadge}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Badge"}
        </Button>
      </div>

      {/* Badge Table */}
      <BadgeTable badges={badges} onDeleteBadge={handleDeleteBadge} />
    </div>
  );
}
