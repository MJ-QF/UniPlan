import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

import { getAcademicTerms } from "../../api/academicTermApi";
import { getLecturesByCourse } from "../../api/lecturesApi";
import type { CourseOfferingResponse } from "../../types/courseOffering";
import type { AcademicTermResponse } from "../../types/wishList";
import type { LectureResponse } from "../../types/lecture";
import { lectureTypeStringToLabel } from "../../types/lecture";

import "./EditCourseOfferingDialog.css";

interface Props {
  offering: CourseOfferingResponse;
  isLoading: boolean;
  serverError?: string;
  onSubmit: (data: {
    sectionNumber: number;
    termID: number;
    lectureID: number;
  }) => void;
  onCancel: () => void;
}

export default function EditCourseOfferingDialog({
  offering,
  isLoading,
  serverError,
  onSubmit,
  onCancel,
}: Props) {
  const courseID = offering.lectureInfo.courseInfo.courseID;

  const [sectionNumber, setSectionNumber] = useState(
    offering.sectionNumber
  );
  const [termID, setTermID] = useState<number>(offering.termInfo.termID);
  const [lectureID, setLectureID] = useState<number>(
    offering.lectureInfo.lectureID
  );

  const [terms, setTerms] = useState<AcademicTermResponse[]>([]);
  const [lectures, setLectures] = useState<LectureResponse[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [localError, setLocalError] = useState("");

  /* Load Data */
  useEffect(() => {
    async function load() {
      try {
        setLoadingData(true);

        const [termsData, lecturesData] = await Promise.all([
          getAcademicTerms(),
          getLecturesByCourse(courseID),
        ]);

        setTerms(termsData);
        setLectures(lecturesData);
      } catch (error) {
        console.error("Failed to load data:", error);
        setLocalError("تعذر تحميل البيانات.");
      } finally {
        setLoadingData(false);
      }
    }

    load();
  }, [courseID]);

  /* Submit */
  function handleSubmit() {
    setLocalError("");

    if (!sectionNumber || sectionNumber < 1) {
      setLocalError("رقم الشعبة غير صالح.");
      return;
    }

    if (!termID) {
      setLocalError("يرجى اختيار الفصل.");
      return;
    }

    if (!lectureID) {
      setLocalError("يرجى اختيار نوع المحاضرة.");
      return;
    }

    onSubmit({ sectionNumber, termID, lectureID });
  }

  const errorToShow = localError || serverError;

  const content = (
    <div className="ecod-overlay" onClick={onCancel} role="presentation">
      <div
        className="ecod-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ecod-title"
      >

        {/* Header */}
        <header className="ecod-header">
          <div className="ecod-header-icon">
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
          </div>
          <div>
            <h3 id="ecod-title" className="ecod-title">
              تعديل الشعبة
            </h3>
            <p className="ecod-subtitle">
              {offering.lectureInfo.courseInfo.courseName}
            </p>
          </div>
        </header>

        {/* Body */}
        <div className="ecod-body">

          {/* Section Number */}
          <div className="ecod-field">
            <label className="ecod-label" htmlFor="ecod-section">
              رقم الشعبة
            </label>
            <input
              id="ecod-section"
              type="number"
              className="ecod-input"
              min={1}
              value={sectionNumber}
              onChange={(e) =>
                setSectionNumber(Math.max(1, Number(e.target.value) || 1))
              }
              disabled={isLoading}
            />
          </div>

          {/* Term */}
          <div className="ecod-field">
            <label className="ecod-label" htmlFor="ecod-term">
              الفصل الدراسي
            </label>
            <div className="ecod-select-wrapper">
              <select
                id="ecod-term"
                className="ecod-select"
                value={termID}
                onChange={(e) => setTermID(Number(e.target.value))}
                disabled={loadingData || isLoading}
              >
                {terms.map((t) => (
                  <option key={t.termID} value={t.termID}>
                    {formatTermType(t.termType)} — {t.termYear}
                  </option>
                ))}
              </select>
              <svg
                className="ecod-chevron"
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
          <div className="ecod-field">
            <label className="ecod-label" htmlFor="ecod-lecture">
              نوع المحاضرة
            </label>
            {lectures.length > 0 ? (
              <div className="ecod-select-wrapper">
                <select
                  id="ecod-lecture"
                  className="ecod-select"
                  value={lectureID}
                  onChange={(e) => setLectureID(Number(e.target.value))}
                  disabled={loadingData || isLoading}
                >
                  {lectures.map((l) => (
                    <option key={l.lectureID} value={l.lectureID}>
                      {lectureTypeStringToLabel(l.lectureType)} ({l.durationValue} د)
                    </option>
                  ))}
                </select>
                <svg
                  className="ecod-chevron"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            ) : (
              <div className="ecod-empty-note">
                {loadingData
                  ? "جاري تحميل المحاضرات..."
                  : "لا توجد محاضرات لهذا المقرر"}
              </div>
            )}
          </div>

          {/* Error */}
          {errorToShow && (
            <div className="ecod-error" role="alert">
              {errorToShow}
            </div>
          )}

        </div>

        {/* Actions */}
        <footer className="ecod-actions">
          <button
            type="button"
            className="ecod-btn ecod-btn-ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            إلغاء
          </button>
          <button
            type="button"
            className="ecod-btn ecod-btn-primary"
            onClick={handleSubmit}
            disabled={isLoading || loadingData}
          >
            {isLoading ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </footer>

      </div>
    </div>
  );

  return createPortal(content, document.body);
}

/* Helper */
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