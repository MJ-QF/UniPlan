import type { PlanStatusItem } from "../../api/studentApi";
import "./CourseCard.css";

interface Props {
  item: PlanStatusItem;
  isSelected: boolean;
  onToggle: () => void;
}

export default function CourseCard({
  item,
  isSelected,
  onToggle,
}: Props) {
  const course = item.course;
  const status = item.status ?? "";

  // ✅ تحديد الحالة
  const isPassed = status === "تم اجتيازها";
  const isUnavailable = status === "غير متاحة";
  const isDisabled = isPassed || isUnavailable;

  // ✅ معلومات الحالة
  const statusInfo = isPassed
    ? { label: "تم اجتيازها", className: "cc-status-passed" }
    : isUnavailable
    ? { label: "غير متاحة", className: "cc-status-unavailable" }
    : { label: "متاحة", className: "cc-status-available" };

  return (
    <button
      type="button"
      className={`cc-card ${isSelected ? "cc-card-selected" : ""} ${
        isDisabled ? "cc-card-disabled" : ""
      }`}
      onClick={onToggle}
      disabled={isDisabled}
      title={
        isPassed
          ? "هذه المادة تم اجتيازها"
          : isUnavailable
          ? "المتطلبات السابقة غير مكتملة"
          : "اضغط للاختيار"
      }
    >
      {/* Checkbox */}
      <div className="cc-check">
        {isSelected && !isDisabled && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>

      {/* Course Info */}
      <div className="cc-info">
        <h3 className="cc-name">{course.courseName}</h3>

        <div className="cc-meta">
          <span className="cc-code">{course.courseCode}</span>
          <span className="cc-dot">•</span>
          <span className="cc-hours">
            {course.creditHours} ساعات
          </span>
        </div>

        {/* Prerequisites */}
        {item.coursePrerequisitesIDs &&
          item.coursePrerequisitesIDs.length > 0 && (
            <div className="cc-prereqs">
              <span className="cc-prereqs-label">المتطلبات:</span>
              <span className="cc-prereqs-values">
                {item.coursePrerequisitesIDs.join(", ")}
              </span>
            </div>
          )}
      </div>

      {/* Status Badge */}
      <span className={`cc-status ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    </button>
  );
}