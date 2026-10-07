import type { CourseResponse } from "../../types/course";
import "./CourseCard.css";

export type CourseStatusVariant = "available" | "passed" | "unavailable";

interface Props {
  course: CourseResponse;
  isSelected: boolean;
  onToggle?: () => void;
  disabled?: boolean;
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
      {/* Top Row: Checkbox + Status */}
      <div className="cc-card-top">
        <div className="cc-check">
          {isSelected && (
            <svg
              width="13"
              height="13"
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

        {statusLabel && (
          <span className={`cc-status cc-status-${statusVariant}`}>
            {statusLabel}
          </span>
        )}
      </div>

      {/* Course Name */}
      <h3 className="cc-name">{course.courseName}</h3>

      {/* Meta */}
      <div className="cc-meta">
        <span className="cc-code">{course.courseCode}</span>
        <span className="cc-hours">
          {course.creditHours} ساعات
        </span>
      </div>

      {/* Needed Hours */}
      {showNeededHours && (
        <div className="cc-needed">
          تحتاج {course.neededHours} ساعة مكتملة
        </div>
      )}

      {/* Prerequisites */}
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
    </button>
  );
}