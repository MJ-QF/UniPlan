import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

import { getAcademicTerms } from "../../api/academicTermApi";
import { getCourses, type Course } from "../../api/courses";
import type { AcademicTermResponse } from "../../types/wishList";
import type { CreateCourseOfferingRequest } from "../../types/courseOffering";
import { LECTURE_TYPE_ENUM } from "../../types/lecture";

import "./CreateCourseOfferingDialog.css";

interface Props {
  adminId: number;
  isLoading: boolean;
  serverError?: string;
  onSubmit: (
    data: Omit<CreateCourseOfferingRequest, "createdByAdminID">
  ) => void;
  onCancel: () => void;
}

const LECTURE_TYPES = [
  { value: LECTURE_TYPE_ENUM.THEORETICAL, label: "نظري" },
  { value: LECTURE_TYPE_ENUM.PRACTICAL, label: "عملي" },
  { value: LECTURE_TYPE_ENUM.TD, label: "تمارين" },
];

export default function CreateCourseOfferingDialog({
  adminId,
  isLoading,
  serverError,
  onSubmit,
  onCancel,
}: Props) {
  const [courseID, setCourseID] = useState<number | "">("");
  const [termID, setTermID] = useState<number | "">("");
  const [lectureType, setLectureType] = useState<number>(
    LECTURE_TYPE_ENUM.THEORETICAL
  );
  const [numberOfSections, setNumberOfSections] = useState<number>(1);

  const [courses, setCourses] = useState<Course[]>([]);
  const [terms, setTerms] = useState<AcademicTermResponse[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [localError, setLocalError] = useState("");

  /* =========================
     Load Data
  ========================= */
  useEffect(() => {
    async function load() {
      try {
        setLoadingData(true);

        const [coursesData, termsData] = await Promise.all([
          getCourses(1, 500),
          getAcademicTerms(),
        ]);

        setCourses(coursesData);
        setTerms(termsData);
      } catch (error) {
        console.error("Failed to load data:", error);
        setLocalError("تعذر تحميل البيانات.");
      } finally {
        setLoadingData(false);
      }
    }

    load();
  }, []);

  /* =========================
     Submit
  ========================= */
  function handleSubmit() {
    setLocalError("");

    if (!courseID) {
      setLocalError("يرجى اختيار المقرر.");
      return;
    }

    if (!termID) {
      setLocalError("يرجى اختيار الفصل.");
      return;
    }

    if (numberOfSections < 1 || numberOfSections > 20) {
      setLocalError("عدد الشعب يجب أن يكون بين 1 و 20.");
      return;
    }

    onSubmit({
      courseID: Number(courseID),
      termID: Number(termID),
      lectureType,
      numberOfSections,
    });
  }

  const errorToShow = localError || serverError;

  const content = (
    <div className="ccod-overlay" onClick={onCancel} role="presentation">
      <div
        className="ccod-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ccod-title"
      >

        {/* Header */}
        <header className="ccod-header">
          <div className="ccod-header-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <div>
            <h3 id="ccod-title" className="ccod-title">
              إضافة شعب دراسية
            </h3>
            <p className="ccod-subtitle">
              حدد المقرر والفصل وعدد الشعب
            </p>
          </div>
        </header>

        {/* Body */}
        <div className="ccod-body">

          {/* Course */}
          <div className="ccod-field">
            <label className="ccod-label" htmlFor="ccod-course">
              المقرر
            </label>
            <div className="ccod-select-wrapper">
              <select
                id="ccod-course"
                className="ccod-select"
                value={courseID}
                onChange={(e) =>
                  setCourseID(e.target.value ? Number(e.target.value) : "")
                }
                disabled={loadingData || isLoading}
              >
                <option value="">
                  {loadingData ? "جاري التحميل..." : "اختر المقرر"}
                </option>
                {courses.map((c) => (
                  <option key={c.courseID} value={c.courseID}>
                    {c.courseCode ? `[${c.courseCode}] ` : ""}
                    {c.courseName}
                  </option>
                ))}
              </select>
              <svg
                className="ccod-chevron"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>

          {/* Term */}
          <div className="ccod-field">
            <label className="ccod-label" htmlFor="ccod-term">
              الفصل الدراسي
            </label>
            <div className="ccod-select-wrapper">
              <select
                id="ccod-term"
                className="ccod-select"
                value={termID}
                onChange={(e) =>
                  setTermID(e.target.value ? Number(e.target.value) : "")
                }
                disabled={loadingData || isLoading}
              >
                <option value="">
                  {loadingData ? "جاري التحميل..." : "اختر الفصل"}
                </option>
                {terms.map((t) => (
                  <option key={t.termID} value={t.termID}>
                    {formatTermType(t.termType)} — {t.termYear}
                  </option>
                ))}
              </select>
              <svg
                className="ccod-chevron"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>

          {/* Lecture Type */}
          <div className="ccod-field">
            <label className="ccod-label">نوع المحاضرة</label>
            <div className="ccod-chips">
              {LECTURE_TYPES.map((lt) => {
                const isSelected = lectureType === lt.value;
                return (
                  <button
                    key={lt.value}
                    type="button"
                    className={`ccod-chip ${isSelected ? "is-selected" : ""}`}
                    onClick={() => setLectureType(lt.value)}
                    disabled={isLoading}
                  >
                    {lt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Number of Sections */}
          <div className="ccod-field">
            <label className="ccod-label" htmlFor="ccod-sections">
              عدد الشعب
            </label>
            <div className="ccod-number-wrapper">
              <button
                type="button"
                className="ccod-number-btn"
                onClick={() =>
                  setNumberOfSections((n) => Math.max(1, n - 1))
                }
                disabled={isLoading || numberOfSections <= 1}
                aria-label="إنقاص"
              >
                −
              </button>
              <input
                id="ccod-sections"
                type="number"
                className="ccod-number-input"
                value={numberOfSections}
                min={1}
                max={20}
                onChange={(e) =>
                  setNumberOfSections(
                    Math.max(1, Math.min(20, Number(e.target.value) || 1))
                  )
                }
                disabled={isLoading}
              />
              <button
                type="button"
                className="ccod-number-btn"
                onClick={() =>
                  setNumberOfSections((n) => Math.min(20, n + 1))
                }
                disabled={isLoading || numberOfSections >= 20}
                aria-label="زيادة"
              >
                +
              </button>
            </div>
          </div>

          {/* Error */}
          {errorToShow && (
            <div className="ccod-error" role="alert">
              {errorToShow}
            </div>
          )}

        </div>

        {/* Actions */}
        <footer className="ccod-actions">
          <button
            type="button"
            className="ccod-btn ccod-btn-ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            إلغاء
          </button>
          <button
            type="button"
            className="ccod-btn ccod-btn-primary"
            onClick={handleSubmit}
            disabled={isLoading || loadingData}
          >
            {isLoading ? "جاري الإنشاء..." : "إنشاء الشعب"}
          </button>
        </footer>

      </div>
    </div>
  );

  return createPortal(content, document.body);
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