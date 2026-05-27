import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { LoadingState } from './LoadingState';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  sortKey?: string;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: keyof T;
  searchPlaceholder?: string;
  loading?: boolean;
  emptyMessage?: string;
  pageSize?: number;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchKey,
  searchPlaceholder = 'Search records...',
  loading = false,
  emptyMessage = 'No records found.',
  pageSize = 10,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'asc' | 'desc' | null;
  }>({ key: null, direction: null });

  // 1. Filtered data
  const filteredData = useMemo(() => {
    if (!searchQuery || !searchKey) return data;
    const query = searchQuery.toLowerCase().trim();
    return data.filter((item) => {
      const value = item[searchKey];
      if (value === undefined || value === null) return false;
      return String(value).toLowerCase().includes(query);
    });
  }, [data, searchQuery, searchKey]);

  // 2. Sorted data
  const sortedData = useMemo(() => {
    const sortKey = sortConfig.key;
    const direction = sortConfig.direction;
    if (!sortKey || !direction) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (aStr < bStr) return direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // 3. Paginated data
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Handle Sort
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
        key = '';
      }
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // Reset pagination on search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="w-full space-y-4">
      {/* Search Input bar */}
      {searchKey && (
        <div className="relative flex items-center max-w-sm">
          <Search className="absolute left-3 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="pl-9 bg-black/40 border-white/10 hover:border-white/20 focus:border-cyan-500/50 text-slate-200 placeholder:text-slate-500 rounded-lg backdrop-blur-sm transition-all duration-300"
          />
        </div>
      )}

      {/* Grid Container */}
      <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden shadow-2xl transition-all duration-300">
        <Table>
          <TableHeader className="bg-white/5 border-b border-white/10">
            <TableRow>
              {columns.map((column, idx) => (
                <TableHead
                  key={idx}
                  className={`text-slate-400 font-bold text-xs uppercase tracking-wider py-4 ${
                    column.className || ''
                  }`}
                >
                  {column.sortable && typeof column.accessor === 'string' ? (
                    <button
                      onClick={() => requestSort(column.accessor as string)}
                      className="flex items-center gap-1.5 hover:text-white transition-colors duration-200"
                    >
                      {column.header}
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <TableRow
                  key={rowIdx}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                >
                  {columns.map((column, colIdx) => {
                    const cellContent =
                      typeof column.accessor === 'function'
                        ? column.accessor(row)
                        : row[column.accessor as string];

                    return (
                      <TableCell
                        key={colIdx}
                        className={`text-slate-300 text-sm py-4 ${
                          column.className || ''
                        }`}
                      >
                        {cellContent ?? '—'}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-slate-500 py-12"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination control footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-1">
          <p className="text-xs text-slate-400">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} of{' '}
            {sortedData.length} records
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="bg-black/20 border-white/10 hover:bg-white/5 disabled:opacity-30 p-2 h-8 w-8"
            >
              <ChevronLeft className="w-4 h-4 text-slate-300" />
            </Button>
            <span className="text-xs font-semibold text-slate-300 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-black/20 border-white/10 hover:bg-white/5 disabled:opacity-30 p-2 h-8 w-8"
            >
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
