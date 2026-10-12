"use client";

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { Pencil, Trash2, Check, X, GripVertical, CheckCircle2, Circle } from "lucide-react";
import { PostItItem, formatPostItDate } from "@/types/postit";

interface PostItCardProps {
  item: PostItItem;
  onDelete: (id: string) => void;
  onUpdate: (id: string, newContent: string) => void;
  onToggleComplete?: (id: string) => void;
}

export function PostItCard({ item, onDelete, onUpdate, onToggleComplete }: PostItCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(item.content);
  const isCompleted = item.state === "completed";

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  const handleSave = () => {
    if (editContent.trim()) {
      onUpdate(item.id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditContent(item.content);
    setIsEditing(false);
  };

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ scale: 0.8, opacity: 0, rotate: -2 }}
      animate={{
        scale: isDragging ? 1.05 : 1,
        opacity: isDragging ? 0.9 : isCompleted ? 0.9 : 1,
        rotate: isDragging ? 3 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 25,
      }}
      className={`relative flex flex-col justify-between p-5 rounded-sm shadow-md transition-all hover:shadow-xl select-none group min-h-[220px] ${
        isCompleted ? "ring-2 ring-emerald-500 shadow-emerald-500/20" : ""
      }`}
      style={{
        ...style,
        backgroundColor: item.color.bg,
        color: "#1f2937", // 텍스트 가독성을 위한 진한 차콜색
        boxShadow: isDragging
          ? "0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2)"
          : `0 4px 6px -1px ${item.color.shadow}, 0 2px 4px -2px ${item.color.shadow}`,
      }}
    >
      {/* 상단 반투명 테이프 느낌 장식 & 카테고리 & 액션 버튼 */}
      <div className="flex items-center justify-between mb-3 border-b border-black/10 pb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-black/10 text-neutral-800 tracking-wider">
            {item.category}
          </span>
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5" /> 완료됨
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* 완료 토글 버튼 */}
          {onToggleComplete && !isEditing && (
            <button
              onClick={() => onToggleComplete(item.id)}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold cursor-pointer transition-all ${
                isCompleted
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                  : "bg-black/5 hover:bg-emerald-600/10 text-neutral-700 hover:text-emerald-700 border border-black/10"
              }`}
              title={isCompleted ? "완료 상태 취소" : "메모 완료로 표시"}
              aria-label={isCompleted ? "완료 상태 취소" : "메모 완료로 표시"}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-[11px]">완료</span>
                </>
              ) : (
                <>
                  <Circle className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="text-[11px]">완료</span>
                </>
              )}
            </button>
          )}

          {/* 드래그 핸들 */}
          <button
            {...attributes}
            {...listeners}
            className="p-1 rounded hover:bg-black/10 text-neutral-600 hover:text-black cursor-grab active:cursor-grabbing touch-none transition-colors"
            title="드래그하여 위치 이동"
            aria-label="드래그 핸들"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {/* 수정 버튼 */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 rounded hover:bg-black/10 text-neutral-600 hover:text-black cursor-pointer transition-colors"
              title="메모 수정"
              aria-label="메모 수정"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}

          {/* 삭제 버튼 */}
          <button
            onClick={() => onDelete(item.id)}
            className="p-1 rounded hover:bg-black/10 text-neutral-600 hover:text-red-700 cursor-pointer transition-colors"
            title="메모 삭제"
            aria-label="메모 삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 내용 영역 */}
      <div className="flex-1 my-1">
        {isEditing ? (
          <div className="flex flex-col h-full gap-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full flex-1 p-2 rounded bg-white/70 border border-black/20 focus:outline-none focus:ring-2 focus:ring-black/40 text-sm resize-none"
              autoFocus
              rows={4}
            />
            <div className="flex justify-end gap-1.5">
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-neutral-900 text-white hover:bg-neutral-800 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> 저장
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-black/10 hover:bg-black/20 text-neutral-800 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> 취소
              </button>
            </div>
          </div>
        ) : (
          <p
            className={`text-sm whitespace-pre-wrap leading-relaxed font-sans break-words transition-all ${
              isCompleted
                ? "text-neutral-700 font-medium"
                : "text-neutral-900 font-medium"
            }`}
          >
            {item.content}
          </p>
        )}
      </div>

      {/* 왼쪽 하단 작성 일시 & 오른쪽 하단 완료 여부 표시 */}
      <div className="mt-3 pt-2 border-t border-black/5 flex items-center justify-between">
        <span className="text-xs opacity-60 font-mono tracking-tight select-none">
          {item.formattedDate || formatPostItDate(item.createdAt)}
        </span>
        {isCompleted && (
          <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-900 bg-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-1 select-none">
            <Check className="w-3 h-3 stroke-[3]" /> 완료
          </span>
        )}
      </div>
    </motion.div>
  );
}
