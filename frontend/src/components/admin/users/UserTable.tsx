import { useState, useEffect } from "react";
import { ArrowUpDown } from "lucide-react";
import type { User as UserType } from "../../../types/user";
import type { accountStatus } from "../../../types/user";
import UserRow from "./UserRow";

interface UserTableProps {
  users: UserType[];
  onChangeStatus: (id: string, status: accountStatus) => void;
  onDelete: (user: UserType) => void;
  disabled?: boolean;
}

type SortField = "name" | "email";
type SortOrder = "asc" | "desc";

const UserTable = ({
  users,
  onChangeStatus,
  onDelete,
  disabled = false,
}: UserTableProps) => {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Clean number of rows per page

  // Reset page to 1 when users filter list updates
  useEffect(() => {
    setCurrentPage(1);
  }, [users.length]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const valA = a[sortField]?.toLowerCase() || "";
    const valB = b[sortField]?.toLowerCase() || "";
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / itemsPerPage));
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border/40 bg-[#121214]/10 shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-[#121214]/30 text-xs font-semibold uppercase tracking-widest text-text-secondary/70">
              {/* USER ID */}
              <th className="px-6 py-4.5">User ID</th>

              {/* NAME (Sortable) */}
              <th
                onClick={() => handleSort("name")}
                className="px-6 py-4.5 cursor-pointer hover:text-text transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  Name
                  <ArrowUpDown size={12} className="opacity-60" />
                </div>
              </th>

              {/* EMAIL (Sortable) */}
              <th
                onClick={() => handleSort("email")}
                className="px-6 py-4.5 cursor-pointer hover:text-text transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  Email
                  <ArrowUpDown size={12} className="opacity-60" />
                </div>
              </th>

              {/* STATUS */}
              <th className="px-6 py-4.5">Status</th>

              {/* JOIN DATE */}
              <th className="px-6 py-4.5">Join Date</th>

              {/* ACTIONS */}
              <th className="px-6 py-4.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10 bg-[#121214]/5">
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <UserRow
                  key={user._id}
                  user={user}
                  onChangeStatus={onChangeStatus}
                  onDelete={onDelete}
                  disabled={disabled}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-sm text-text-secondary/80 bg-surface/10"
                >
                  No matching users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/40 bg-[#121214]/20 px-6 py-4 select-none">
          <span className="text-xs text-text-secondary/70 font-semibold">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            {/* Previous page arrow */}
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded-md border border-border/50 bg-neutral-900/60 text-text-secondary hover:text-text hover:bg-white/5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              &lt;
            </button>

            {/* Page number buttons */}
            {getPageNumbers().map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-xs text-text-secondary/60 font-semibold"
                  >
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={`page-${page}`}
                  onClick={() => setCurrentPage(page as number)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer border ${
                    currentPage === page
                      ? "bg-primary border-primary text-tertiary shadow-sm"
                      : "border-border/50 bg-neutral-900/60 text-text-secondary hover:text-text hover:bg-white/5"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            {/* Next page arrow */}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded-md border border-border/50 bg-neutral-900/60 text-text-secondary hover:text-text hover:bg-white/5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
