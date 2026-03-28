"use client";

import React, { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export interface Column<T> {
  key: keyof T;
  header: string;
  format?: (value: any) => React.ReactNode;
  align?: "left" | "center" | "right";
  sortable?: boolean;
}

export interface DataTableEditorialProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: keyof T;
  onRowClick?: (row: T) => void;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  showFooter?: boolean;
  footerRow?: Record<string, any>;
}

type SortDirection = "asc" | "desc" | null;

/**
 * Editorial-style data table
 * Clean, type-driven layout with optional sorting
 */
export function DataTableEditorial<T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  onRowClick,
  striped = true,
  hoverable = true,
  compact = false,
  showFooter = false,
  footerRow,
}: DataTableEditorialProps<T>) {
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Handle sorting
  const handleSort = (key: keyof T) => {
    if (sortColumn === key) {
      // Cycle: asc -> desc -> none
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(key);
      setSortDirection("asc");
    }
  };

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortColumn || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal === bVal) return 0;
      if (aVal == null) return sortDirection === "asc" ? 1 : -1;
      if (bVal == null) return sortDirection === "asc" ? -1 : 1;

      const comparison = aVal > bVal ? 1 : -1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection]);

  return (
    <div className="data-table-editorial-wrapper">
      <table
        className={`data-table-editorial ${compact ? "compact" : ""} ${striped ? "striped" : ""} ${hoverable ? "hoverable" : ""}`}
      >
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                onClick={() => col.sortable && handleSort(col.key)}
                className={`col-${String(col.key)} align-${col.align || "left"} ${col.sortable ? "sortable" : ""}`}
              >
                <div className="th-content">
                  <span>{col.header}</span>
                  {col.sortable && sortColumn === col.key && (
                    <span className="sort-indicator">
                      {sortDirection === "asc" ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {sortedData.map((row) => (
            <tr
              key={String(row[rowKey])}
              className={onRowClick ? "clickable" : ""}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className={`col-${String(col.key)} align-${col.align || "left"}`}
                >
                  {col.format ? col.format(row[col.key]) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>

        {showFooter && footerRow && (
          <tfoot>
            <tr className="footer-row">
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className={`col-${String(col.key)} align-${col.align || "left"}`}
                >
                  {col.format
                    ? col.format(footerRow[String(col.key)])
                    : footerRow[String(col.key)]}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>

      {sortedData.length === 0 && (
        <div className="table-empty">
          <p>No data available</p>
        </div>
      )}
    </div>
  );
}
