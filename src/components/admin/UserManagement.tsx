"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Plus,
  Download,
  Eye,
  X,
  Save
} from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Badge } from "@/components/shadcn/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/shadcn/dropdown-menu";
import { ConfirmModal } from "@/components/shadcn/confirm-modal";
import { useConfirmModal } from "@/hooks/useConfirmModal";
import { adminAPI, User, UpdateUserData } from "@/api/admin";

interface EditUserForm {
  name: string;
  email: string;
  display_roles: string[];
  status: "active" | "suspended" | "banned";
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<EditUserForm>({
    name: "",
    email: "",
    display_roles: [],
    status: "active"
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // View Profile modal state
  const [isViewProfileOpen, setIsViewProfileOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  const { openConfirmModal, closeConfirmModal, isOpen, title, message, onConfirm } = useConfirmModal();

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminAPI.getUsers(currentPage, usersPerPage);
      if (response.success) {
        setUsers(response.data);
        setFilteredUsers(response.data);
        setTotalUsers(response.pagination.total);
        setTotalPages(response.pagination.last_page);
      } else {
        setError("Failed to fetch users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.display_roles.includes(roleFilter));
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, statusFilter, roleFilter]);

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      display_roles: [...user.display_roles],
      status: user.status
    });
    setIsEditModalOpen(true);
  };

  const handleViewProfile = (user: User) => {
    setViewingUser(user);
    setIsViewProfileOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      setSavingEdit(true);
      const updateData: UpdateUserData = {
        name: editForm.name,
        email: editForm.email,
        display_roles: editForm.display_roles,
        status: editForm.status
      };

      const response = await adminAPI.updateUser(editingUser.id, updateData);

      if (response.success) {
        // Update the user in the list
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === editingUser.id
              ? { ...user, ...editForm }
              : user
          )
        );

        // Close modal and reset state
        setIsEditModalOpen(false);
        setEditingUser(null);
        setEditForm({
          name: "",
          email: "",
          display_roles: [],
          status: "active"
        });
      } else {
        setError(response.message || "Failed to update user");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      setError("Failed to update user");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
    setEditForm({
      name: "",
      email: "",
      display_roles: [],
      status: "active"
    });
  };

  const handleDeleteUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    openConfirmModal({
      title: "Delete User",
      message: `Are you sure you want to delete ${user?.name}? This action cannot be undone and will permanently remove the user account.`,
      onConfirm: async () => {
        try {
          const response = await adminAPI.deleteUser(userId);
          if (response.success) {
            setUsers(users.filter(user => user.id !== userId));
            closeConfirmModal();
          } else {
            setError(response.message || "Failed to delete user");
            closeConfirmModal();
          }
        } catch (err) {
          console.error("Error deleting user:", err);
          setError("Failed to delete user");
          closeConfirmModal();
        }
      }
    });
  };

  const handleBulkAction = (action: "delete" | "suspend" | "activate") => {
    if (selectedUsers.length === 0) return;

    const actionText = action === "delete" ? "delete" : action === "suspend" ? "suspend" : "activate";

    openConfirmModal({
      title: `Bulk ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
      message: `Are you sure you want to ${actionText} ${selectedUsers.length} selected user(s)?`,
      onConfirm: async () => {
        try {
          // Handle bulk action - you can implement this based on your API
          // For now, we'll just clear the selection
          setSelectedUsers([]);
          closeConfirmModal();
        } catch (err) {
          console.error(`Error performing bulk ${actionText}:`, err);
          setError(`Failed to ${actionText} users`);
          closeConfirmModal();
        }
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleRoleToggle = (role: string) => {
    setEditForm(prev => ({
      ...prev,
      display_roles: prev.display_roles.includes(role)
        ? prev.display_roles.filter(r => r !== role)
        : [...prev.display_roles, role]
    }));
  };

  const getStatusBadge = (status: string) => {
    if (!status) return null;

    const variants = {
      active: "default",
      suspended: "secondary",
      banned: "destructive"
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRoleBadge = (roles: string[]) => {
    if (!roles || roles.length === 0) {
      return (
        <Badge variant="outline" className="mr-1">
          User
        </Badge>
      );
    }

    return roles.map(role => (
      <Badge key={role} variant="outline" className="mr-1">
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    ));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>


            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="mod">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedUsers.length} user(s) selected
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("activate")}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("suspend")}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Suspend
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("delete")}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({totalUsers})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-left p-3 font-medium">Comments</th>
                  <th className="text-left p-3 font-medium">Joined</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {(user.name || "U").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name || "Unknown User"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm text-gray-900">{user.email || "No email"}</div>
                      {user.email_verified_at && (
                        <Badge variant="secondary" className="text-xs">Verified</Badge>
                      )}
                    </td>
                    <td className="p-3">
                      {getRoleBadge(user.display_roles)}
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-gray-900">{user.comment_count || 0}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-gray-500">{formatDate(user.created_at)}</span>
                    </td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
                          <DropdownMenuItem onClick={() => handleViewProfile(user)} className="hover:bg-gray-50">
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditUser(user)} className="hover:bg-gray-50">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing page {currentPage} of {totalPages} ({totalUsers} total users)
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleCancelEdit}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Edit className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit User: {editingUser?.name}
                </h3>
              </div>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Basic Information</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter user name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Account Status</h4>
                <div className="grid grid-cols-3 gap-3">
                  {(["active", "suspended", "banned"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setEditForm(prev => ({ ...prev, status }))}
                      className={`p-3 border rounded-lg text-left transition-colors ${editForm.status === status
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-gray-400"
                        }`}
                    >
                      <div className="font-medium capitalize">{status}</div>
                      <div className="text-sm text-gray-500">
                        {status === "active" && "User can access the platform"}
                        {status === "suspended" && "User access temporarily restricted"}
                        {status === "banned" && "User permanently banned"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Roles */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">User Roles</h4>
                <div className="space-y-3">
                  {(["user", "mod", "admin"] as const).map((role) => (
                    <label key={role} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={editForm.display_roles.includes(role)}
                        onChange={() => handleRoleToggle(role)}
                        className="rounded border-gray-300"
                      />
                      <div>
                        <div className="font-medium capitalize">{role}</div>
                        <div className="text-sm text-gray-500">
                          {role === "user" && "Basic user permissions"}
                          {role === "mod" && "Moderator with content management rights"}
                          {role === "admin" && "Full administrative access"}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={savingEdit}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={savingEdit}
              >
                {savingEdit ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {savingEdit ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {isViewProfileOpen && viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsViewProfileOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Eye className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  View Profile: {viewingUser.name}
                </h3>
              </div>
              <button
                onClick={() => setIsViewProfileOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Basic Information</h4>
                  <p><span className="font-semibold">Name:</span> {viewingUser.name || "N/A"}</p>
                  <p><span className="font-semibold">Email:</span> {viewingUser.email || "N/A"}</p>
                  <p><span className="font-semibold">Email Verified:</span> {viewingUser.email_verified_at ? "Yes" : "No"}</p>
                  <p><span className="font-semibold">Joined:</span> {formatDate(viewingUser.created_at)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Account Status</h4>
                  <p><span className="font-semibold">Status:</span> {getStatusBadge(viewingUser.status || "active")}</p>
                  <p><span className="font-semibold">Comment Count:</span> {viewingUser.comment_count || 0}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">User Roles</h4>
                <div className="space-y-2">
                  {viewingUser.display_roles.map(role => (
                    <Badge key={role} variant="outline" className="mr-1">
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setIsViewProfileOpen(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isOpen}
        title={title}
        message={message}
        onConfirm={onConfirm}
        onCancel={closeConfirmModal}
      />
    </div>
  );
}
