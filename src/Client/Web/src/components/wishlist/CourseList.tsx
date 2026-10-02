import type { PlanStatusItem } from "../../api/studentApi";
import CourseCard from "./CourseCard";
import "./CourseList.css";

interface Props {
  items: PlanStatusItem[];
  selectedIds: number[];
  onToggle: (courseId: number) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export default function CourseList({
  items,
  selectedIds,
  onToggle,
  loading = false,
  emptyMessage = "لا توجد مواد متاحة حالياً.",
}: Props) {
  if (loading) {
    return (
      <div className="cl-loading">
        <div className="cl-spinner" />
        <p>جاري تحميل المواد...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cl-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="cl-list">
      {items.map((item) => (
        <CourseCard
          key={item.course.courseID}
          item={item}
          isSelected={selectedIds.includes(item.course.courseID)}
          onToggle={() => onToggle(item.course.courseID)}
        />
      ))}
    </div>
  );
}