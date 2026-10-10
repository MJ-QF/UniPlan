/* =========================
   Days of Week
   القيم مبنية على TimeSlots.DayNum من السكريبت:
   0 = الأحد، 1 = الاثنين، ...، 6 = السبت
========================= */
export interface DayOption {
  value: number;
  label: string;
  shortLabel: string;
}

export const WEEK_DAYS: DayOption[] = [
  { value: 0, label: "الأحد", shortLabel: "أحد" },
  { value: 1, label: "الاثنين", shortLabel: "اثنين" },
  { value: 2, label: "الثلاثاء", shortLabel: "ثلاثاء" },
  { value: 3, label: "الأربعاء", shortLabel: "أربعاء" },
  { value: 4, label: "الخميس", shortLabel: "خميس" },
  { value: 5, label: "الجمعة", shortLabel: "جمعة" },
  { value: 6, label: "السبت", shortLabel: "سبت" },
];

/* الأيام المسموحة للإنشاء (أيام الدوام) */
export const WORK_DAYS: DayOption[] = WEEK_DAYS.filter(
  (d) => d.value >= 0 && d.value <= 4
);

/* =========================
   Helpers
========================= */
export function getDayLabel(day: string | null): string {
  if (!day) return "—";

  const map: Record<string, string> = {
    Sunday: "الأحد",
    Monday: "الاثنين",
    Tuesday: "الثلاثاء",
    Wednesday: "الأربعاء",
    Thursday: "الخميس",
    Friday: "الجمعة",
    Saturday: "السبت",
  };

  return map[day] ?? day;
}

/* "08:00:00" → "08:00 ص" */
export function formatTime(time: string): string {
  if (!time) return "—";

  const [hourStr, minute] = time.split(":");
  const hour = parseInt(hourStr, 10);

  const period = hour >= 12 ? "م" : "ص";
  const hour12 = hour % 12 || 12;

  return `${String(hour12).padStart(2, "0")}:${minute} ${period}`;
}

/* =========================
   Lecture Type Labels
========================= */
export function getLectureTypeLabel(type: string | null): string {
  if (!type) return "—";

  const map: Record<string, string> = {
    Theory: "نظري",
    Practical: "عملي",
    Lab: "مخبر",
    Tutorial: "تمرين",
  };

  return map[type] ?? type;
}