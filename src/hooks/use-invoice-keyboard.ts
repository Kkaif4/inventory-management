"use client";

import { useRef, useCallback, useEffect } from "react";

interface UseInvoiceKeyboardOptions {
  onSubmit: () => void;
  onDeleteRow: (rowIndex: number) => void;
  onFocusLastRow: () => void;
  totalColumns: number;
  formRef: React.RefObject<HTMLElement | null>;
}

export function useInvoiceKeyboard({
  onSubmit,
  onDeleteRow,
  onFocusLastRow,
  totalColumns,
  formRef,
}: UseInvoiceKeyboardOptions) {
  const cellRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const currentRow = useRef(0);

  const registerRef = useCallback(
    (row: number, col: number, el: HTMLInputElement | null) => {
      const key = `${row}-${col}`;
      if (el) {
        cellRefs.current.set(key, el);
      } else {
        cellRefs.current.delete(key);
      }
    },
    [],
  );

  const focusCell = useCallback((row: number, col: number) => {
    const key = `${row}-${col}`;
    const el = cellRefs.current.get(key);
    if (el) {
      el.focus();
      currentRow.current = row;
      return true;
    }
    return false;
  }, []);

  const advanceFromCell = useCallback(
    (row: number, col: number) => {
      // Try next column in same row
      if (col + 1 < totalColumns) {
        if (focusCell(row, col + 1)) return;
      }
      // Try first column of next row
      focusCell(row + 1, 0);
    },
    [totalColumns, focusCell],
  );

  // Global keyboard shortcuts
  useEffect(() => {
    const container = formRef.current;
    if (!container) return;

    const handler = (e: KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter → submit
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        onSubmit();
        return;
      }

      // Ctrl+D → delete current row
      if (e.ctrlKey && e.key === "d") {
        e.preventDefault();
        onDeleteRow(currentRow.current);
        return;
      }

      // Alt+N → focus last empty row's product field
      if (e.altKey && e.key === "n") {
        e.preventDefault();
        onFocusLastRow();
        return;
      }
    };

    container.addEventListener("keydown", handler);
    return () => container.removeEventListener("keydown", handler);
  }, [formRef, onSubmit, onDeleteRow, onFocusLastRow]);

  return {
    registerRef,
    focusCell,
    advanceFromCell,
    currentRow,
  };
}
