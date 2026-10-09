"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-800" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2.5 rounded-full border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 shadow-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer flex items-center justify-center gap-2"
      aria-label="테마 전환"
      title={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-500 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}
