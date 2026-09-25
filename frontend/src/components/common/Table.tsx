import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  sortable?: boolean;
  sortKey?: string;
  align?: "left" | "center" | "right";
  className?: string;
  headerClassName?: string;
  width?: string;
  render?: (item: T, index: number) => React.ReactNode;
  accessor?: keyof T | ((item: T) => React.ReactNode);
}

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T, index: number) => string | number;
  loading?: boolean;
  loadingMessage?: string;
  emptyMessage?: React.ReactNode;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: string) => void;
  pagination?: TablePaginationProps;
  onRowClick?: (item: T, index: number) => void;
  rowClassName?: string | ((item: T, index: number) => string);
  className?: string;
}

export function Table<T>({
  data,
  columns,
  keyExtractor,
  loading = false,
  loadingMessage = "Loading data...",
  emptyMessage = "No matching records found.",
  sortField,
  sortOrder = "asc",
  onSort,
  pagination,
  onRowClick,
  rowClassName,
  className = "",
}: TableProps<T>) {
  const handleSort = (col: Column<T>) => {
    if (!col.sortable || !onSort) return;
    const targetKey = col.sortKey || col.key;
    onSort(targetKey);
  };

  const getSortIcon = (col: Column<T>) => {
    if (!col.sortable) return null;
    const targetKey = col.sortKey || col.key;
    const isCurrent = sortField === targetKey;

    if (!isCurrent) {
      return (
        <ArrowUpDown
          size={12}
          className="opacity-50 hover:opacity-100 transition-opacity"
        />
      );
    }

    return sortOrder === "desc" ? (
      <ArrowDown size={12} className="text-primary opacity-100" />
    ) : (
      <ArrowUp size={12} className="text-primary opacity-100" />
    );
  };

  const getAlignmentClass = (align?: "left" | "center" | "right") => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  const getPageNumbers = () => {
    if (!pagination) return [];
    const { currentPage, totalPages } = pagination;
    const pages: (number | string)[] = [];

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
    <div
      className={`overflow-hidden rounded-lg border border-border/40 bg-[#121214]/10 shadow-md ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-[#121214]/30 text-xs font-semibold uppercase tracking-widest text-text-secondary/70">
              {columns.map((col) => {
                const alignClass = getAlignmentClass(col.align);
                const isSortActive =
                  col.sortable && sortField === (col.sortKey || col.key);

                return (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    onClick={() => handleSort(col)}
                    className={`px-6 py-4.5 select-none ${alignClass} ${
                      col.sortable
                        ? "cursor-pointer hover:text-text transition-colors"
                        : ""
                    } ${isSortActive ? "text-text" : ""} ${
                      col.headerClassName || ""
                    }`}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === "right"
                          ? "justify-end"
                          : col.align === "center"
                            ? "justify-center"
                            : "justify-start"
                      }`}
                    >
                      <span>{col.header}</span>
                      {getSortIcon(col)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-border/10 bg-[#121214]/5">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-text-secondary">
                    <Loader2 size={24} className="animate-spin text-primary" />
                    <span className="text-xs font-medium">
                      {loadingMessage}
                    </span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm text-text-secondary/80 bg-surface/10"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => {
                const rowKey = keyExtractor(item, rowIndex);
                const dynamicRowClass =
                  typeof rowClassName === "function"
                    ? rowClassName(item, rowIndex)
                    : rowClassName || "";

                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick && onRowClick(item, rowIndex)}
                    className={`border-b border-border/30 hover:bg-white/[0.015] transition-colors group ${
                      onRowClick ? "cursor-pointer" : ""
                    } ${dynamicRowClass}`}
                  >
                    {columns.map((col) => {
                      const alignClass = getAlignmentClass(col.align);
                      let cellContent: React.ReactNode = null;

                      if (col.render) {
                        cellContent = col.render(item, rowIndex);
                      } else if (typeof col.accessor === "function") {
                        cellContent = col.accessor(item);
                      } else if (col.accessor) {
                        cellContent = String(
                          (item as Record<string, unknown>)[
                            col.accessor as string
                          ] ?? "",
                        );
                      } else if (
                        col.key &&
                        (item as Record<string, unknown>)[col.key] !== undefined
                      ) {
                        cellContent = String(
                          (item as Record<string, unknown>)[col.key] ?? "",
                        );
                      }

                      return (
                        <td
                          key={`${String(rowKey)}-${col.key}`}
                          className={`px-6 py-4 whitespace-nowrap text-sm ${alignClass} ${
                            col.className || ""
                          }`}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/40 bg-[#121214]/20 px-6 py-4 select-none">
          <span className="text-xs text-text-secondary/70 font-semibold">
            Page {pagination.currentPage} of {pagination.totalPages}
            {pagination.totalItems !== undefined && (
              <span className="ml-1 text-text-secondary/50">
                ({pagination.totalItems} total)
              </span>
            )}
          </span>

          <div className="flex items-center gap-1.5">
            {/* Previous Page Button */}
            <button
              onClick={() =>
                pagination.onPageChange(Math.max(1, pagination.currentPage - 1))
              }
              disabled={pagination.currentPage === 1 || loading}
              className="px-2.5 py-1 rounded-md border border-border/50 bg-neutral-900/60 text-text-secondary hover:text-text hover:bg-white/5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition text-xs"
              aria-label="Previous Page"
            >
              &lt;
            </button>

            {/* Page Numbers with Ellipsis */}
            {getPageNumbers().map((page, idx) => {
              if (page === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 text-xs text-text-secondary/60 font-semibold"
                  >
                    ...
                  </span>
                );
              }

              const isCurrent = pagination.currentPage === page;
              return (
                <button
                  key={`page-${page}`}
                  onClick={() => pagination.onPageChange(page as number)}
                  disabled={loading}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer border ${
                    isCurrent
                      ? "bg-primary border-primary text-tertiary shadow-sm font-bold"
                      : "border-border/50 bg-neutral-900/60 text-text-secondary hover:text-text hover:bg-white/5"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            {/* Next Page Button */}
            <button
              onClick={() =>
                pagination.onPageChange(
                  Math.min(pagination.totalPages, pagination.currentPage + 1),
                )
              }
              disabled={
                pagination.currentPage === pagination.totalPages || loading
              }
              className="px-2.5 py-1 rounded-md border border-border/50 bg-neutral-900/60 text-text-secondary hover:text-text hover:bg-white/5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition text-xs"
              aria-label="Next Page"
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;
