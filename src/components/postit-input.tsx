"use client";

import React, { useState } from "react";
import { Plus, ChevronDown } from "lucide-react";
import { Category, POSTIT_COLORS, PostItItem } from "@/types/postit";

interface PostItInputProps {
  onAdd: (item: PostItItem) => void;
}

const CATEGORIES: Category[] = ["할 일", "아이디어", "기타"];

export function PostItInput({ onAdd }: PostItInputProps) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category>("할 일");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    // 무작위 색상 선택
    const randomColor =
      POSTIT_COLORS[Math.floor(Math.random() * POSTIT_COLORS.length)];

    const newItem: PostItItem = {
      id: String(Date.now()), // 타임스탬프 기반 고유 ID
      content: content.trim(),
      category,
      color: randomColor,
      createdAt: new Date().toISOString(),
      state: "active",
      order: 0,
    };

    onAdd(newItem);
    setContent("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex flex-col gap-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="새로운 생각이나 할 일을 포스트잇에 적어보세요..."
          rows={3}
          className="w-full resize-none bg-transparent placeholder-neutral-400 dark:placeholder-neutral-500 text-neutral-800 dark:text-neutral-100 text-sm sm:text-base focus:outline-none leading-relaxed"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleSubmit(e);
            }
          }}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          {/* 카테고리 선택 드롭다운 */}
          <div className="relative inline-flex items-center">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              aria-label="메모 카테고리 선택"
              className="appearance-none bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs sm:text-sm font-medium py-2 pl-3.5 pr-8 rounded-lg cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2.5 pointer-events-none text-neutral-500" />
          </div>

          {/* 추가 버튼 */}
          <button
            type="submit"
            disabled={!content.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-amber-950 font-semibold text-xs sm:text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            포스트잇 붙이기
          </button>
        </div>
      </div>
    </form>
  );
}
