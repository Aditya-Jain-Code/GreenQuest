"use client";

import { useEffect, useState } from "react";
import {
  getAllUsers,
  deleteUser,
  updateUser,
  updateUserRole,
} from "@/utils/db/actions/users";
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
} from "@/components/ui/dialog";
import { Pencil, Trash2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

interface User {
  id: number;
  name: string;
  email: string;
  level: number;
  role: string;
  createdAt: Date;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 🔥 Fetch all users on page load
  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await getAllUsers();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // 🔎 Filter users based on search term
  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // ✏️ Open edit modal
  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  // 📝 Handle user update (name, email, level)
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      await updateUser(selectedUser.id, {
        name: selectedUser.name,
        email: selectedUser.email,
        level: selectedUser.level,
      });
      toast.success("User updated successfully!");
      setIsEditOpen(false);
      refreshUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user.");
    }
  };

  // 🔄 Update user role
  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success("User role updated successfully!");
      refreshUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role.");
    }
  };

  // ❌ Handle delete user
  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(userId);
      toast.success("User deleted successfully!");
      refreshUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user.");
    }
  };

  // 🔄 Refresh user list
  const refreshUsers = async () => {
    const data = await getAllUsers();
    setUsers(data);
    setFilteredUsers(data);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-green-700">
        👥 User Management
      </h1>

      {/* Search Bar */}
      <Input
        type="text"
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 w-full md:w-1/2"
      />

      {/* User Table */}
      {isLoading ? (
        <p className="text-center text-gray-500">Loading users...</p>
      ) : (
        <Table className="w-full bg-white shadow-md rounded-lg">
          <TableHeader>
            <TableRow>
              <TableCell className="font-bold">ID</TableCell>
              <TableCell className="font-bold">Name</TableCell>
              <TableCell className="font-bold">Email</TableCell>
              <TableCell className="font-bold">Level</TableCell>
              <TableCell className="font-bold">Role</TableCell>
              <TableCell className="font-bold">Created At</TableCell>
              <TableCell className="font-bold">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-gray-50">
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.level}</TableCell>
                <TableCell>
                  <select
                    value={user.role}
                    onChange={(e) =>
                      handleUpdateUserRole(user.id, e.target.value)
                    }
                    className="border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="user">User</option>
                    <option value="agent">Agent</option>
                    <option value="admin">Admin</option>
                  </select>
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="flex space-x-2">
                  <Button
                    onClick={() => openEditDialog(user)}
                    className="bg-blue-500 text-white px-3 py-1"
                  >
                    <Pencil size={18} />
                  </Button>
                  <Button
                    onClick={() => handleDeleteUser(user.id)}
                    className="bg-red-500 text-white px-3 py-1"
                  >
                    <Trash2 size={18} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit User Dialog */}
      {isEditOpen && selectedUser && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                label="Name"
                value={selectedUser.name}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, name: e.target.value })
                }
              />
              <Input
                label="Email"
                value={selectedUser.email}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, email: e.target.value })
                }
              />
              <Input
                label="Level"
                type="number"
                value={selectedUser.level}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, level: +e.target.value })
                }
              />
            </div>
            <DialogFooter>
              <Button
                onClick={() => setIsEditOpen(false)}
                className="bg-gray-500"
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateUser} className="bg-green-500">
                <CheckCircle size={18} className="mr-1" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
