"use client";

import React, { useState } from "react";
import { Link2, Check, RefreshCw, AlertCircle } from "lucide-react";
import { setGoogleScriptUrl } from "@/lib/google-sheet";

interface GoogleSheetConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  onSave: (url: string) => void;
  onRefresh: () => void;
  isSyncing: boolean;
}

export function GoogleSheetConfigModal({
  isOpen,
  onClose,
  currentUrl,
  onSave,
  onRefresh,
  isSyncing,
}: GoogleSheetConfigModalProps) {
  const [url, setUrl] = useState(currentUrl);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleScriptUrl(url);
    onSave(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold">구글 시트 연동 설정</h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-sm cursor-pointer"
          >
            닫기
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
              구글 앱스 스크립트 웹 앱 URL (Web App URL)
            </label>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>연동 방법 안내</span>
            </div>
            <ol className="list-decimal pl-4 space-y-1 text-amber-800 dark:text-amber-300/90 text-[11px] leading-relaxed">
              <li>제공된 스프레드시트의 상단 메뉴 [확장 프로그램] → [Apps Script]를 엽니다.</li>
              <li><code>docs/google_apps_script.js</code>의 코드를 붙여넣고 저장합니다.</li>
              <li>우측 상단 [배포] → [새 배포] → 유형: [웹 앱]을 선택합니다.</li>
              <li>액세스 권한을 <b>&apos;모든 사용자(Anyone)&apos;</b>로 설정 후 배포합니다.</li>
              <li>생성된 웹 앱 URL(<code>.../exec</code>)을 위 입력란에 붙여넣으세요.</li>
            </ol>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={!url || isSyncing}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              시트 데이터 즉시 동기화
            </button>

            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer transition-colors"
            >
              저장 및 연동
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
