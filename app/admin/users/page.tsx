"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Trash, ChevronLeft, ChevronRight } from "lucide-react";
import { getAllUsers, deleteUser } from "@/utils/db/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<
    Array<{ id: number; email: string; name: string; createdAt: Date }>
  >([]);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // Fetch Users on Page Load
  useEffect(() => {
    async function fetchUsers() {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    }
    fetchUsers();
  }, []);

  // Open Delete Confirmation Dialog
  const confirmDelete = (userId: number) => {
    setDeleteUserId(userId);
    setIsDialogOpen(true);
  };

  // Handle User Deletion
  const handleDelete = async () => {
    if (!deleteUserId) return;

    const result = await deleteUser(deleteUserId);
    if (result.success) {
      toast.success("User deleted successfully!");
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== deleteUserId)
      );
    } else {
      toast.error("Failed to delete user.");
    }

    setIsDialogOpen(false);
    setDeleteUserId(null);
  };

  // Pagination Logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const nextPage = () => {
    if (currentPage < Math.ceil(users.length / usersPerPage)) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Manage Users</h1>

      <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-left">Name</th>
            <th className="p-4 text-left">Email</th>
            <th className="p-4 text-left">Created At</th>
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.length > 0 ? (
            currentUsers.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="flex justify-center">
                    <Button
                      variant="destructive"
                      onClick={() => confirmDelete(user.id)}
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
              <td colSpan={4} className="p-4 text-center text-gray-500">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {users.length > usersPerPage && (
        <div className="flex justify-between items-center mt-4">
          <Button
            onClick={prevPage}
            disabled={currentPage === 1}
            variant="outline"
            className="flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Previous
          </Button>

          <span className="text-gray-700">
            Page {currentPage} of {Math.ceil(users.length / usersPerPage)}
          </span>

          <Button
            onClick={nextPage}
            disabled={currentPage === Math.ceil(users.length / usersPerPage)}
            variant="outline"
            className="flex items-center"
          >
            Next <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm User Deletion</DialogTitle>
            <p className="text-gray-600">
              Are you sure you want to delete this user? This action cannot be
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
