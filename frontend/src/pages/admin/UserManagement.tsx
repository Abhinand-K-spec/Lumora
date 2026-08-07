import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useUsers } from "../../hooks/admin/useUsers";
import type { User as UserType } from "../../types/user";
import type { accountStatus } from "../../types/user";

import UserStats from "../../components/admin/users/UserStats";
import UserFilters from "../../components/admin/users/UserFilters";
import UserTable from "../../components/admin/users/UserTable";
import DeleteUserModal from "../../components/admin/users/DeleteUserModal";

const UserManagement = () => {
  const { users, loading, changeStatus, deleteUser, fetchUsers } = useUsers();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<UserType | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Apply filters locally (Photographers and Admins are excluded as they are in different collections)
  // Therefore, all users fetched by useUsers() are Clients/Regular Users.
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "ALL" || user.accountStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleChangeStatus = async (id: string, status: accountStatus) => {
    setActionLoading(true);
    await changeStatus(id, status);
    setActionLoading(false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUserForDelete) return;
    setActionLoading(true);
    await deleteUser(selectedUserForDelete._id);
    setActionLoading(false);
    setSelectedUserForDelete(null);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white p-6 md:p-10 font-body">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/20 pb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-heading font-normal text-[#D8B06A] tracking-wide">
              User Management
            </h1>
            <p className="text-text-secondary/80 text-sm mt-2 font-light">
              Manage and monitor platform user activity across all global regions.
            </p>
          </div>
          
          {/* Refresh Action */}
          <button
            onClick={fetchUsers}
            disabled={loading || actionLoading}
            className="flex items-center justify-center gap-2 self-start sm:self-center px-4 py-2.5 rounded-lg border border-border/40 bg-surface hover:bg-neutral/40 text-text text-sm font-semibold tracking-wide transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh Data
          </button>
        </div>

        {/* Metric Cards (Total, Active, Suspended) */}
        <UserStats users={users} />

        {/* Control Bar (Status Filter Pills, Search Bar, Count) */}
        <UserFilters
          statusValue={filterStatus}
          onStatusChange={setFilterStatus}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          totalCount={users.length}
        />

        {/* User Table Grid */}
        {loading && users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <RefreshCw size={36} className="animate-spin text-primary" />
            <p className="text-sm text-text-secondary/70">Retrieving user directories...</p>
          </div>
        ) : (
          <UserTable
            users={filteredUsers}
            onChangeStatus={handleChangeStatus}
            onDelete={setSelectedUserForDelete}
            disabled={actionLoading}
          />
        )}
      </div>

      {/* Delete User Modal Dialog */}
      <DeleteUserModal
        isOpen={!!selectedUserForDelete}
        userName={selectedUserForDelete?.name || ""}
        loading={actionLoading}
        onClose={() => setSelectedUserForDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default UserManagement;
