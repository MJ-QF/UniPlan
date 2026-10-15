import type { CourseResponse } from "./course";

/* =========================
   LectureType Enum
   ⚠️ في الطلب: 1 / 2 / 3
   ⚠️ في الاستجابة: نص
========================= */
export const LECTURE_TYPE_ENUM = {
  THEORETICAL: 1,
  PRACTICAL: 2,
  TD: 3,
} as const;

export type LectureTypeNumber = 1 | 2 | 3;

/* =========================
   Response
========================= */
export interface LectureResponse {
  lectureID: number;
  lectureType: string | null;   /* "Theoretical" | "Practical" | "TD" */
  durationValue: number;
  courseInfo: CourseResponse;
}

/* =========================
   Helpers — Mapping
========================= */

/* من رقم → عربي */
export function lectureTypeNumberToLabel(type: number): string {
  switch (type) {
    case 1: return "نظري";
    case 2: return "عملي";
    case 3: return "تمارين";
    default: return "غير معروف";
  }
}

/* من نص الباك → عربي */
export function lectureTypeStringToLabel(type: string | null): string {
  if (!type) return "غير محدد";

  const map: Record<string, string> = {
    Theoretical: "نظري",
    Theory: "نظري",
    Practical: "عملي",
    TD: "تمارين",
  };

  return map[type] ?? type;
}