"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { AnimatePresence } from "framer-motion";
import { StickyNote, Sparkles, Sheet, RefreshCw, CheckCircle2 } from "lucide-react";
import { FilterCategory, POSTIT_COLORS, PostItItem } from "@/types/postit";
import { PostItInput } from "@/components/postit-input";
import { PostItCard } from "@/components/postit-card";
import { CategoryFilter } from "@/components/category-filter";
import { ThemeToggle } from "@/components/theme-toggle";
import { GoogleSheetConfigModal } from "@/components/google-sheet-config-modal";
import {
  getGoogleScriptUrl,
  fetchSheetItems,
  createSheetItem,
  updateSheetItem,
  deleteSheetItem,
  reorderSheetItems,
} from "@/lib/google-sheet";

const INITIAL_ITEMS: PostItItem[] = [
  {
    id: "sample-1",
    content: "Next.js 16과 Framer Motion으로 애니메이션 효과 적용하기 ✨",
    category: "할 일",
    color: POSTIT_COLORS[0],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "sample-2",
    content: "포스트잇 드래그 앤 드롭으로 우선순위 재배치 기능 테스트",
    category: "아이디어",
    color: POSTIT_COLORS[1],
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: "sample-3",
    content: "다크 모드와 라이트 모드 전환 시 스타일 자연스럽게 어울리는지 확인",
    category: "기타",
    color: POSTIT_COLORS[2],
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: "sample-4",
    content: "구글 시트 연동으로 실시간 메모 CRUD(생성, 수정, 삭제) 테스트",
    category: "할 일",
    color: POSTIT_COLORS[3],
    createdAt: new Date().toISOString(),
  },
];

export default function Home() {
  const [items, setItems] = useState<PostItItem[]>([]);
  const [filter, setFilter] = useState<FilterCategory>("전체");
  const [isLoaded, setIsLoaded] = useState(false);
  const [scriptUrl, setScriptUrl] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // 구글 시트에서 데이터 동기화 함수
  const syncWithSheet = useCallback(async (url: string) => {
    if (!url) return;
    setIsSyncing(true);
    setSyncStatus("동기화 중...");
    try {
      const sheetItems = await fetchSheetItems(url);
      setItems(sheetItems);
      setSyncStatus("동기화 완료");
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (err) {
      console.error(err);
      setSyncStatus("동기화 오류");
      setTimeout(() => setSyncStatus(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // 초기 로드: 로컬 스토리지 & 구글 시트 URL 확인
  useEffect(() => {
    const url = getGoogleScriptUrl();
    setScriptUrl(url);

    try {
      const saved = localStorage.getItem("postit_todo_items");
      if (saved) {
        setItems(JSON.parse(saved));
      } else {
        setItems(INITIAL_ITEMS);
      }
    } catch {
      setItems(INITIAL_ITEMS);
    }
    setIsLoaded(true);

    if (url) {
      syncWithSheet(url);
    }
  }, [syncWithSheet]);

  // 로컬 스토리지 캐시 유지
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("postit_todo_items", JSON.stringify(items));
      } catch (e) {
        console.error("Failed to save to localStorage", e);
      }
    }
  }, [items, isLoaded]);

  // 센서 설정 (마우스 및 모바일 터치 이벤트 최적화)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // [Create] 메모 추가
  const handleAddItem = async (newItem: PostItItem) => {
    // 1. UI 즉시 반영 (Optimistic Update)
    setItems((prev) => [newItem, ...prev]);

    // 2. 구글 시트 연동 시 원격 추가
    if (scriptUrl) {
      try {
        await createSheetItem(scriptUrl, newItem);
      } catch (e) {
        console.error("Failed to create on Google Sheet", e);
      }
    }
  };

  // [Delete] 메모 즉시 삭제
  const handleDeleteItem = async (id: string) => {
    // 1. UI 즉시 삭제
    setItems((prev) => prev.filter((item) => item.id !== id));

    // 2. 구글 시트 원격 삭제
    if (scriptUrl) {
      try {
        await deleteSheetItem(scriptUrl, id);
      } catch (e) {
        console.error("Failed to delete on Google Sheet", e);
      }
    }
  };

  // [Update] 메모 내용 수정
  const handleUpdateItem = async (id: string, newContent: string) => {
    // 1. UI 즉시 수정
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, content: newContent } : item
      )
    );

    // 2. 구글 시트 원격 수정
    if (scriptUrl) {
      try {
        await updateSheetItem(scriptUrl, id, { content: newContent });
      } catch (e) {
        console.error("Failed to update on Google Sheet", e);
      }
    }
  };

  // 드래그 앤 드롭 완료
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    let updatedList: PostItItem[] = [];

    setItems((prev) => {
      const oldIndex = prev.findIndex((item) => item.id === active.id);
      const newIndex = prev.findIndex((item) => item.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const reordered = arrayMove(prev, oldIndex, newIndex).map((item, idx) => ({
        ...item,
        order: idx,
      }));
      updatedList = reordered;
      return reordered;
    });

    if (scriptUrl && updatedList.length > 0) {
      try {
        const orderData = updatedList.map((item, idx) => ({
          timestamp: item.id,
          order: idx,
        }));
        await reorderSheetItems(scriptUrl, orderData);
      } catch (e) {
        console.error("Failed to sync reorder to Google Sheet", e);
      }
    }
  };

  // 필터링된 아이템 계산
  const filteredItems = useMemo(() => {
    if (filter === "전체") return items;
    return items.filter((item) => item.category === filter);
  }, [items, filter]);

  // 카테고리별 개수 카운트
  const counts = useMemo(() => {
    const base: Record<FilterCategory, number> = {
      전체: items.length,
      "할 일": 0,
      아이디어: 0,
      기타: 0,
    };
    items.forEach((item) => {
      if (base[item.category] !== undefined) {
        base[item.category]++;
      }
    });
    return base;
  }, [items]);

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 selection:bg-amber-200 dark:selection:bg-amber-900 transition-colors">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-neutral-950/70 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-300 dark:bg-amber-400 text-neutral-950 shadow-xs rotate-[-3deg]">
              <StickyNote className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                Post-it Todo List
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* 구글 시트 연동 버튼 */}
            <button
              onClick={() => setIsModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                scriptUrl
                  ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                  : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
              title="구글 시트 연동 설정"
            >
              <Sheet className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">
                {scriptUrl ? "구글 시트 연동됨" : "구글 시트 연동"}
              </span>
              {syncStatus && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                  ({syncStatus})
                </span>
              )}
            </button>

            {/* 수동 동기화 버튼 (연동 시 활성화) */}
            {scriptUrl && (
              <button
                onClick={() => syncWithSheet(scriptUrl)}
                disabled={isSyncing}
                className="p-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer disabled:opacity-40 transition-colors"
                title="시트 데이터 다시 불러오기"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isSyncing ? "animate-spin text-emerald-500" : ""}`}
                />
              </button>
            )}

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col items-center">
        {/* 입력 폼 섹션 */}
        <section className="w-full flex flex-col items-center mb-8">
          <PostItInput onAdd={handleAddItem} />
        </section>

        {/* 필터 및 목록 헤더 */}
        <section className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-sm sm:text-base text-neutral-700 dark:text-neutral-300">
              {filter === "전체" ? "모든 포스트잇" : `[${filter}] 포스트잇`}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
              {filteredItems.length}개
            </span>
          </div>

          <CategoryFilter
            currentFilter={filter}
            onFilterChange={setFilter}
            counts={counts}
          />
        </section>

        {/* 포스트잇 그리드 레이아웃 */}
        <section className="w-full flex-1">
          {filteredItems.length === 0 ? (
            <div className="w-full py-16 flex flex-col items-center justify-center text-center rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40">
              <StickyNote className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mb-3" />
              <p className="text-neutral-600 dark:text-neutral-400 font-medium text-sm">
                등록된 포스트잇이 없습니다.
              </p>
              <p className="text-neutral-400 dark:text-neutral-600 text-xs mt-1">
                상단 입력창에서 새로운 메모나 할 일을 적어보세요!
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredItems.map((item) => item.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
                  <AnimatePresence>
                    {filteredItems.map((item) => (
                      <PostItCard
                        key={item.id}
                        item={item}
                        onDelete={handleDeleteItem}
                        onUpdate={handleUpdateItem}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </SortableContext>
            </DndContext>
          )}
        </section>
      </main>

      {/* 푸터 */}
      <footer className="w-full py-8 border-t border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-center text-sm font-medium text-neutral-600 dark:text-neutral-300 flex flex-col sm:flex-row items-center justify-center gap-2 mt-auto">
        <span>Copyright INU Post-it Todo List by Sungyoon Jung</span>
        {scriptUrl && (
          <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-normal">
            &bull; <CheckCircle2 className="w-3.5 h-3.5" /> 구글 시트 연동 활성화됨
          </span>
        )}
      </footer>

      {/* 구글 시트 연동 모달 */}
      <GoogleSheetConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUrl={scriptUrl}
        onSave={(newUrl) => {
          setScriptUrl(newUrl);
          if (newUrl) syncWithSheet(newUrl);
        }}
        onRefresh={() => syncWithSheet(scriptUrl)}
        isSyncing={isSyncing}
      />
    </div>
  );
}
