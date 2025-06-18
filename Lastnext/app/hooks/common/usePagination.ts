'use client';

import { useState, useMemo, useCallback } from 'react';

export interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
  pageSizeOptions?: number[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageSizeOptions: number[];
}

export interface PaginationActions {
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (size: number) => void;
  resetPagination: () => void;
}

export interface UsePaginationResult extends PaginationState, PaginationActions {}

/**
 * A custom hook for handling pagination state and calculations.
 * 
 * @param options - Pagination options
 * @returns Pagination state and actions
 * 
 * @example
 * ```tsx
 * const {
 *   currentPage,
 *   pageSize,
 *   totalPages,
 *   goToPage,
 *   nextPage,
 *   previousPage,
 *   setPageSize
 * } = usePagination({
 *   initialPage: 1,
 *   initialPageSize: 10,
 *   totalItems: 100,
 *   onPageChange: (page) => console.log('Page changed:', page),
 *   onPageSizeChange: (size) => console.log('Page size changed:', size)
 * });
 * ```
 */
export function usePagination({
  initialPage = 1,
  initialPageSize = 10,
  totalItems = 0,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
}: PaginationOptions = {}): UsePaginationResult {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Calculate pagination values
  const paginationState = useMemo<PaginationState>(() => {
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;

    return {
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      hasNextPage,
      hasPreviousPage,
      pageSizeOptions,
    };
  }, [currentPage, pageSize, totalItems, pageSizeOptions]);

  // Pagination actions
  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, paginationState.totalPages));
    setCurrentPage(validPage);
    onPageChange?.(validPage);
  }, [paginationState.totalPages, onPageChange]);

  const nextPage = useCallback(() => {
    if (paginationState.hasNextPage) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      onPageChange?.(nextPage);
    }
  }, [currentPage, paginationState.hasNextPage, onPageChange]);

  const previousPage = useCallback(() => {
    if (paginationState.hasPreviousPage) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      onPageChange?.(prevPage);
    }
  }, [currentPage, paginationState.hasPreviousPage, onPageChange]);

  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
    onPageSizeChange?.(size);
  }, [onPageSizeChange]);

  const resetPagination = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  // Return pagination state and actions
  return {
    ...paginationState,
    goToPage,
    nextPage,
    previousPage,
    setPageSize: handleSetPageSize,
    resetPagination,
  };
}

/**
 * A utility function to generate an array of page numbers for pagination display.
 * 
 * @param currentPage - Current page number
 * @param totalPages - Total number of pages
 * @param maxVisiblePages - Maximum number of page buttons to show
 * @returns Array of page numbers to display
 * 
 * @example
 * ```tsx
 * const pageNumbers = getPageNumbers(currentPage, totalPages, 5);
 * // Returns: [1, 2, 3, 4, 5] or [1, '...', 4, 5, 6, 7, 8, '...', 20]
 * ```
 */
export function getPageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisiblePages: number = 5
): (number | string)[] {
  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const halfVisible = Math.floor(maxVisiblePages / 2);
  let startPage = Math.max(1, currentPage - halfVisible);
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pages: (number | string)[] = [];

  if (startPage > 1) {
    pages.push(1);
    if (startPage > 2) {
      pages.push('...');
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push('...');
    }
    pages.push(totalPages);
  }

  return pages;
}

/**
 * A utility function to format pagination information for display.
 * 
 * @param startIndex - Starting index of current page
 * @param endIndex - Ending index of current page
 * @param totalItems - Total number of items
 * @returns Formatted string showing current range and total
 * 
 * @example
 * ```tsx
 * const info = formatPaginationInfo(startIndex, endIndex, totalItems);
 * // Returns: "Showing 1-10 of 100 items"
 * ```
 */
export function formatPaginationInfo(
  startIndex: number,
  endIndex: number,
  totalItems: number
): string {
  if (totalItems === 0) {
    return 'No items to display';
  }

  const start = startIndex + 1;
  const end = endIndex;
  const total = totalItems;

  return `Showing ${start}-${end} of ${total} items`;
}