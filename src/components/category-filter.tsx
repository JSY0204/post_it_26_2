"use client";

import React from "react";
import { ChevronDown, Filter } from "lucide-react";
import { FilterCategory } from "@/types/postit";

interface CategoryFilterProps {
  currentFilter: FilterCategory;
  onFilterChange: (category: FilterCategory) => void;
  counts: Record<FilterCategory, number>;
}

const FILTER_OPTIONS: FilterCategory[] = ["전체", "할 일", "아이디어", "기타"];

export function CategoryFilter({
  currentFilter,
  onFilterChange,
  counts,
}: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-flex items-center">
        <Filter className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
        <select
          value={currentFilter}
          onChange={(e) => onFilterChange(e.target.value as FilterCategory)}
          aria-label="카테고리 필터링"
          className="appearance-none bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 text-sm font-medium py-2 pl-9 pr-9 rounded-xl cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-2xs focus:outline-none"
        >
          {FILTER_OPTIONS.map((filter) => (
            <option key={filter} value={filter}>
              {filter} ({counts[filter] || 0})
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-3 pointer-events-none text-neutral-400" />
      </div>
    </div>
  );
}
