import type { CourseOfferingResponse } from "../../types/courseOffering";
import { lectureTypeStringToLabel } from "../../types/lecture";
import "./CourseOfferingCard.css";

interface Props {
  offering: CourseOfferingResponse;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CourseOfferingCard({
  offering,
  onEdit,
  onDelete,
}: Props) {
  const course = offering.lectureInfo.courseInfo;
  const lectureTypeLabel = lectureTypeStringToLabel(
    offering.lectureInfo.lectureType
  );

  const term = offering.termInfo;
  const termLabel = term
    ? `${formatTermType(term.termType)} — ${term.termYear}`
    : "فصل غير محدد";

  return (
    <article className="coc-card">

      {/* Top: Section + Term */}
      <div className="coc-top">
        <span className="coc-section-badge">
          شعبة {offering.sectionNumber}
        </span>
        <span className="coc-term">{termLabel}</span>
      </div>

      {/* Course Name */}
      <h3 className="coc-course-name">{course.courseName}</h3>

      {/* Course Code */}
      <div className="coc-code-row">
        <span className="coc-code">{course.courseCode}</span>
        <span className="coc-credits">{course.creditHours} ساعات</span>
      </div>

      {/* Meta */}
      <div className="coc-meta">
        <span className="coc-meta-item">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {offering.lectureInfo.durationValue} دقيقة
        </span>

        <span className="coc-meta-item">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          {lectureTypeLabel}
        </span>
      </div>

      {/* Actions */}
      <div className="coc-actions">
        <button
          type="button"
          className="coc-btn coc-btn-edit"
          onClick={onEdit}
          aria-label="تعديل الشعبة"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          تعديل
        </button>

        <button
          type="button"
          className="coc-btn coc-btn-delete"
          onClick={onDelete}
          aria-label="حذف الشعبة"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          حذف
        </button>
      </div>

    </article>
  );
}

/* =========================
   Helper
========================= */
function formatTermType(termType: string | null): string {
  if (!termType) return "فصل";

  const map: Record<string, string> = {
    "1": "الفصل الأول",
    "2": "الفصل الثاني",
    "3": "الفصل الصيفي",
    Fall: "الفصل الأول",
    Spring: "الفصل الثاني",
    Summer: "الفصل الصيفي",
    الأول: "الفصل الأول",
    الثاني: "الفصل الثاني",
    الصيفي: "الفصل الصيفي",
  };

  return map[termType] ?? termType;
}