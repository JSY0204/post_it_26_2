import { PostItItem, POSTIT_COLORS, formatPostItDate, Category } from "@/types/postit";

export interface GoogleSheetRow {
  timestamp: string;
  datetime: string;
  content: string;
  category?: string;
  color?: string;
  state?: "active" | "completed" | "deleted";
  order?: number;
}

// .env.local의 NEXT_PUBLIC_GOOGLE_SCRIPT_URL 또는 로컬스토리지에서 Web App URL 가져오기
export function getGoogleScriptUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim();
  }
  if (typeof window !== "undefined") {
    const customUrl = localStorage.getItem("google_sheet_webapp_url");
    if (customUrl) return customUrl.trim();
  }
  return "";
}

export function setGoogleScriptUrl(url: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("google_sheet_webapp_url", url.trim());
  }
}

/**
 * 구글 시트에서 전체 메모 목록 가져오기 (Read)
 */
export async function fetchSheetItems(scriptUrl: string): Promise<PostItItem[]> {
  if (!scriptUrl) return [];

  const response = await fetch(scriptUrl, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`구글 시트 연동 실패: ${response.statusText}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || "데이터 불러오기 실패");
  }

  return (result.data || []).map((row: GoogleSheetRow, idx: number) => {
    // 저장된 색상 또는 무작위 색상 매칭
    const matchedColor =
      POSTIT_COLORS.find((c) => c.bg === row.color) ||
      POSTIT_COLORS[Math.floor(Math.random() * POSTIT_COLORS.length)];

    return {
      id: String(row.timestamp),
      content: String(row.content || ""),
      category: (row.category as Category) || "할 일",
      color: matchedColor,
      createdAt: new Date().toISOString(),
      formattedDate: String(row.datetime || ""),
      state: row.state || "active",
      order: row.order !== undefined ? Number(row.order) : idx,
    };
  });
}

/**
 * 구글 시트에 새 메모 추가 (Create)
 */
export async function createSheetItem(scriptUrl: string, item: PostItItem): Promise<boolean> {
  if (!scriptUrl) return false;

  const payload = {
    action: "create",
    data: {
      timestamp: item.id,
      datetime: item.formattedDate || formatPostItDate(item.createdAt),
      content: item.content,
      category: item.category,
      color: item.color.bg,
      state: item.state || "active",
      order: item.order !== undefined ? item.order : 0,
    },
  };

  const res = await fetch(scriptUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  return res.ok;
}

/**
 * 구글 시트의 메모 내용 및 속성 수정 (Update)
 */
export async function updateSheetItem(
  scriptUrl: string,
  timestamp: string,
  updates: Partial<{
    content: string;
    category: Category;
    color: string;
    state: "active" | "completed" | "deleted";
    order: number;
  }>
): Promise<boolean> {
  if (!scriptUrl) return false;

  const payload = {
    action: "update",
    data: {
      timestamp,
      ...updates,
    },
  };

  const res = await fetch(scriptUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  return res.ok;
}

/**
 * 구글 시트의 메모 즉시 삭제 (Delete)
 */
export async function deleteSheetItem(
  scriptUrl: string,
  timestamp: string
): Promise<boolean> {
  if (!scriptUrl) return false;

  const payload = {
    action: "delete",
    data: {
      timestamp,
    },
  };

  const res = await fetch(scriptUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  return res.ok;
}

/**
 * 드래그 앤 드롭 순서(order) 일괄 갱신
 */
export async function reorderSheetItems(
  scriptUrl: string,
  items: { timestamp: string; order: number }[]
): Promise<boolean> {
  if (!scriptUrl) return false;

  const payload = {
    action: "reorder",
    data: items,
  };

  const res = await fetch(scriptUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  return res.ok;
}
