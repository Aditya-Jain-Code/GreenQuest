"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";

interface Badge {
  id: number;
  name: string;
  description: string;
  category: string;
  criteria: any;
  createdAt: string;
}

interface BadgeTableProps {
  badges: Badge[];
  onDeleteBadge: (id: number) => void;
}

const BadgeTable: React.FC<BadgeTableProps> = ({ badges, onDeleteBadge }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4">🏆 All Badges</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                Name
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                Category
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                Description
              </th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {badges.map((badge) => (
              <tr key={badge.id} className="hover:bg-gray-50">
                <td className="py-3 px-4">{badge.name}</td>
                <td className="py-3 px-4">{badge.category}</td>
                <td className="py-3 px-4">{badge.description}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:bg-red-100"
                      onClick={() => onDeleteBadge(badge.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-blue-600 hover:bg-blue-100"
                    >
                      <Edit size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {badges.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 px-4 text-center text-gray-500">
                  No badges found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BadgeTable;
