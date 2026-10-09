import type { CourseResponse } from "../../types/course";
import CourseCard, {
  type CourseStatusVariant,
} from "./CourseCard";
import "./CourseList.css";

export interface CourseListItem {
  course: CourseResponse;
  statusLabel?: string;
  statusVariant?: CourseStatusVariant;
  prereqNames?: string[];
  disabled?: boolean;
}

interface Props {
  items: CourseListItem[];
  selectedIds: number[];
  onToggle: (courseId: number) => void;
  loading?: boolean;
  emptyMessage?: string;
  enableScroll?: boolean;
}

export default function CourseList({
  items,
  selectedIds,
  onToggle,
  loading = false,
  emptyMessage = "لا توجد مواد متاحة حالياً.",
  enableScroll = true,
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
    <div
      className={`cl-list ${enableScroll ? "" : "cl-list-static"}`}
    >
      {items.map((item) => (
        <CourseCard
          key={item.course.courseID}
          course={item.course}
          isSelected={selectedIds.includes(item.course.courseID)}
          onToggle={() => onToggle(item.course.courseID)}
          disabled={item.disabled}
          statusLabel={item.statusLabel}
          statusVariant={item.statusVariant}
          prereqNames={item.prereqNames}
        />
      ))}
    </div>
  );
}