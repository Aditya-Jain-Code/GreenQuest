"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  getAllUsers,
  deleteUser,
  updateUser,
  updateUserRole,
  getUserByEmail,
  createUser,
} from "@/utils/db/actions/users";
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
import {
  Pencil,
  Trash2,
  CheckCircle,
  PlusCircle,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const [isAddUserOpen, setIsAddUserOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] =
    useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authorized, setAuthorized] = useState<boolean>(false);

  // ✅ State for new user fields
  const [newUserName, setNewUserName] = useState<string>("");
  const [newUserEmail, setNewUserEmail] = useState<string>("");

  const router = useRouter();

  // ✅ Check if logged-in user is admin
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const adminEmail = localStorage.getItem("adminEmail");
        if (!adminEmail) {
          router.push("/not-authorized");
          return;
        }

        const user = await getUserByEmail(adminEmail);
        if (user?.role !== "admin") {
          router.push("/not-authorized");
          return;
        }

        setAuthorized(true);
      } catch (error) {
        console.error("❌ Error verifying user role:", error);
        router.push("/not-authorized");
      }
    };

    checkUserRole();
  }, [router]);

  // 🔥 Fetch all users
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

    if (authorized) {
      fetchUsers();
    }
  }, [authorized]);

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
    setSelectedUser({ ...user }); // ✅ Clone user to prevent modifying original data
    setIsEditOpen(true);
  };

  // 📝 Handle user update
  const handleUpdateUser = async () => {
    if (!selectedUser) {
      toast.error("No user selected.");
      return;
    }
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

  // 📝 Handle input changes in the edit modal
  const handleEditChange = (field: keyof User, value: string | number) => {
    if (selectedUser) {
      setSelectedUser({ ...selectedUser, [field]: value });
    }
  };

  // ➕ Handle adding new user
  const handleAddUser = async () => {
    if (!newUserEmail || !newUserName) {
      toast.error("Please fill out all fields.");
      return;
    }

    try {
      const newUser = await createUser(newUserEmail, newUserName);

      if (newUser) {
        toast.success("User added successfully!");
        setIsAddUserOpen(false);
        refreshUsers();
        resetNewUserForm();
      } else {
        toast.error("User already exists or failed to create.");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user.");
    }
  };

  // ❌ Open delete confirmation dialog
  const confirmDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteConfirmOpen(true);
  };

  // ❌ Handle delete user with confirmation
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id);
      toast.success("User deleted successfully!");
      setIsDeleteConfirmOpen(false);
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

  // 🔄 Reset new user form
  const resetNewUserForm = () => {
    setNewUserName("");
    setNewUserEmail("");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-green-700">
        👥 User Management
      </h1>

      <div className="flex justify-between items-center mb-4">
        <Input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:min-w-[300px] md:max-w-[500px] py-3 text-lg"
        />
        <Button
          onClick={() => setIsAddUserOpen(true)}
          className="bg-green-500 text-white"
        >
          <PlusCircle size={18} className="mr-1" />
          Add User
        </Button>
      </div>

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
                    onClick={() => confirmDeleteUser(user)}
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

      {/* ✅ Add New User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              label="Name"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
            />
            <Input
              label="Email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsAddUserOpen(false)}
              className="bg-gray-500"
            >
              Cancel
            </Button>
            <Button onClick={handleAddUser} className="bg-green-500">
              <CheckCircle size={18} className="mr-1" />
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 📝 Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <Input
                label="Name"
                value={selectedUser.name}
                onChange={(e) => handleEditChange("name", e.target.value)}
              />
              <Input
                label="Email"
                value={selectedUser.email}
                onChange={(e) => handleEditChange("email", e.target.value)}
              />
              <Input
                label="Level"
                type="number"
                value={selectedUser.level}
                onChange={(e) => handleEditChange("level", +e.target.value)}
              />
            </div>
          )}
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

      {/* ❗️ Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">
              <AlertTriangle className="inline-block mr-2 text-red-600" />
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{userToDelete?.name}</span>? This
            action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="bg-gray-500"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteUser}
              className="bg-red-500 text-white"
            >
              <Trash2 size={18} className="mr-1" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
