import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { TOAST_MESSAGES } from "../../constants/messages";

import adminUserService, { type UserStats } from "../../services/adminUserService";
import type { User } from "../../types/user";
import type { accountStatus } from "../../types/user";

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const itemsPerPage = 5;

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortField, setSortField] = useState<"name" | "email">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    suspended: 0,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);

    try {
      const response = await adminUserService.getUsers({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        status: filterStatus !== "ALL" ? filterStatus : undefined,
        sortField,
        sortOrder,
      });

      if (response.data) {
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);
        setTotalUsers(response.data.total);
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      }
    } catch (error) {
      toast.error(TOAST_MESSAGES.ADMIN.FETCH_USERS_FAILED);
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, filterStatus, sortField, sortOrder]);

  const changeStatus = async (id: string, status: accountStatus) => {
    try {
      await adminUserService.changeStatus(id, status);

      toast.success(TOAST_MESSAGES.ADMIN.USER_STATUS_UPDATED);

      await fetchUsers();
    } catch (error) {
      toast.error(TOAST_MESSAGES.ADMIN.USER_STATUS_UPDATE_FAILED);
      console.log(error);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await adminUserService.deleteUser(id);

      toast.success(TOAST_MESSAGES.ADMIN.USER_DELETED);

      await fetchUsers();
    } catch (error) {
      toast.error(TOAST_MESSAGES.ADMIN.USER_DELETE_FAILED);
      console.log(error);
    }
  };

  const handleSort = (field: "name" | "email") => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    totalUsers,
    searchQuery,
    setSearchQuery: handleSearchChange,
    filterStatus,
    setFilterStatus: handleStatusChange,
    sortField,
    sortOrder,
    handleSort,
    stats,
    fetchUsers,
    changeStatus,
    deleteUser,
  };
};
