export type Category = "할 일" | "아이디어" | "기타";
export type FilterCategory = "전체" | Category;

export type PostItColor = {
  bg: string;
  shadow: string;
  tape: string;
  name: string;
};

export const POSTIT_COLORS: PostItColor[] = [
  {
    bg: "#FEF08A", // 노란색
    shadow: "rgba(234, 179, 8, 0.25)",
    tape: "rgba(254, 240, 138, 0.6)",
    name: "yellow",
  },
  {
    bg: "#FBCFE8", // 분홍색
    shadow: "rgba(236, 72, 153, 0.25)",
    tape: "rgba(251, 207, 232, 0.6)",
    name: "pink",
  },
  {
    bg: "#BBF7D0", // 초록색
    shadow: "rgba(34, 197, 94, 0.25)",
    tape: "rgba(187, 247, 208, 0.6)",
    name: "green",
  },
  {
    bg: "#BFDBFE", // 파랑색
    shadow: "rgba(59, 130, 246, 0.25)",
    tape: "rgba(191, 219, 254, 0.6)",
    name: "blue",
  },
];

export interface PostItItem {
  id: string; // timestamp
  content: string;
  category: Category;
  color: PostItColor;
  createdAt: string; // ISO string
  formattedDate?: string; // datetime
  state?: "active" | "completed" | "deleted";
  order?: number;
}

export function formatPostItDate(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const dayName = days[date.getDay()];
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}.${month}.${day} (${dayName}) ${hours}:${minutes}`;
}
