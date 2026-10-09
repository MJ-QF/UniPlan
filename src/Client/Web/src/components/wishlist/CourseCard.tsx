import type { CourseResponse } from "../../types/course";
import "../courses/CourseCard.css";

export type CourseStatusVariant = "available" | "passed" | "unavailable";

interface Props {
  course: CourseResponse;
  isSelected: boolean;
  onToggle?: () => void;
  disabled?: boolean;

  /* اختياري — يظهر فقط لو موجود */
  statusLabel?: string;
  statusVariant?: CourseStatusVariant;
  prereqCodes?: string[];
}

export default function CourseCard({
  course,
  isSelected,
  onToggle,
  disabled = false,
  statusLabel,
  statusVariant = "available",
  prereqCodes,
}: Props) {
  const showNeededHours =
    course.neededHours !== null && course.neededHours > 0;

  const showPrereqs = prereqCodes && prereqCodes.length > 0;

  return (
    <button
      type="button"
      className={`cc-card ${isSelected ? "cc-card-selected" : ""} ${
        disabled ? "cc-card-disabled" : ""
      }`}
      onClick={disabled ? undefined : onToggle}
      disabled={disabled}
    >
      {/* Checkbox */}
      <div className="cc-check">
        {isSelected && (
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

      {/* Info */}
      <div className="cc-info">
        <h3 className="cc-name">{course.courseName}</h3>

        <div className="cc-meta">
          <span className="cc-code">{course.courseCode}</span>
          <span className="cc-dot">•</span>
          <span className="cc-hours">{course.creditHours} ساعات</span>

          {showNeededHours && (
            <>
              <span className="cc-dot">•</span>
              <span className="cc-needed">
                تحتاج {course.neededHours} ساعة
              </span>
            </>
          )}
        </div>

        {showPrereqs && (
          <div className="cc-prereqs">
            <span className="cc-prereqs-label">المتطلبات:</span>
            <div className="cc-prereqs-chips">
              {prereqCodes.map((code) => (
                <span key={code} className="cc-prereq-chip">
                  {code}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Badge */}
      {statusLabel && (
        <span className={`cc-status cc-status-${statusVariant}`}>
          {statusLabel}
        </span>
      )}
    </button>
  );
}