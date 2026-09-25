import { useMemo } from "react";
import type { User as UserType } from "../../../types/user";
import type { accountStatus } from "../../../types/user";
import { Table, type Column } from "../../common/Table";
import UserActions from "./UserActions";

interface UserTableProps {
  users: UserType[];
  onChangeStatus: (id: string, status: accountStatus) => void;
  onDelete: (user: UserType) => void;
  disabled?: boolean;
  currentPage?: number;
  totalPages?: number;
  sortField?: "name" | "email";
  sortOrder?: "asc" | "desc";
  onSort?: (field: "name" | "email") => void;
  onPageChange?: (page: number) => void;
}

const UserTable = ({
  users,
  onChangeStatus,
  onDelete,
  disabled = false,
  currentPage = 1,
  totalPages = 1,
  sortField = "name",
  sortOrder = "asc",
  onSort,
  onPageChange,
}: UserTableProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const columns: Column<UserType>[] = useMemo(
    () => [
      {
        key: "userId",
        header: "User ID",
        render: (user) => (
          <span className="font-semibold text-text-secondary/70 group-hover:text-text-secondary transition-colors">
            {`#LM-${user._id.slice(-5).toUpperCase()}`}
          </span>
        ),
      },
      {
        key: "name",
        header: "Name",
        sortable: true,
        sortKey: "name",
        render: (user) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-neutral-900/60 font-bold text-xs text-primary shadow-sm">
              {getInitials(user.name)}
            </div>
            <div>
              <div className="text-sm font-semibold text-text group-hover:text-primary transition-colors">
                {user.name}
              </div>
              <div className="text-[10px] text-text-secondary/80">Client</div>
            </div>
          </div>
        ),
      },
      {
        key: "email",
        header: "Email",
        sortable: true,
        sortKey: "email",
        className: "text-text-secondary/85",
        accessor: "email",
      },
      {
        key: "status",
        header: "Status",
        render: (user) => (
          <div className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                user.accountStatus === "ACTIVE" ? "bg-success" : "bg-error"
              }`}
            />
            <span className="text-[13px] font-medium text-text">
              {user.accountStatus === "ACTIVE" ? "Active" : "Suspended"}
            </span>
          </div>
        ),
      },
      {
        key: "createdAt",
        header: "Join Date",
        className: "text-text-secondary/85",
        render: (user) => formatDate(user.createdAt),
      },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        render: (user) => (
          <div className="flex items-center justify-end">
            <UserActions
              status={user.accountStatus}
              onChangeStatus={(newStatus) =>
                onChangeStatus(user._id, newStatus)
              }
              onDelete={() => onDelete(user)}
              disabled={disabled}
            />
          </div>
        ),
      },
    ],
    [disabled, onChangeStatus, onDelete],
  );

  return (
    <Table<UserType>
      data={users}
      columns={columns}
      keyExtractor={(user) => user._id}
      sortField={sortField}
      sortOrder={sortOrder}
      onSort={(field) => onSort && onSort(field as "name" | "email")}
      emptyMessage="No matching users found."
      pagination={
        onPageChange
          ? {
              currentPage,
              totalPages,
              onPageChange,
            }
          : undefined
      }
    />
  );
};

export default UserTable;
