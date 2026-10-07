import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getPlanStatus } from "../../api/studentApi";
import { createWishList } from "../../api/wishLists";
import { getStudentId } from "../../utils/session";

import TermSelector from "../../components/wishlist/TermSelector";
import CourseList, {
  type CourseListItem,
} from "../../components/courses/CourseList";

import "./WishListCreatePage.css";

export default function WishListCreatePage() {
  const navigate = useNavigate();
  const studentId = getStudentId();

  const [termId, setTermId] = useState("");
  const [items, setItems] = useState<CourseListItem[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  /* =========================
     Load Courses — بدون شارات (نفس المكون)
  ========================= */
  useEffect(() => {
    async function load() {
      if (studentId === null) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const planItems = await getPlanStatus(studentId);

        /* ✅ نفس المكون — بدون statusLabel / disabled */
        const built: CourseListItem[] = planItems.map((item) => ({
          course: item.course,
          prereqCodes: item.coursePrerequisitesCodes ?? [],
        }));

        setItems(built);
      } catch (err) {
        console.error("Failed to load courses:", err);
        setErrorMessage("تعذر تحميل المواد.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [studentId, navigate]);

  /* =========================
     Toggle
  ========================= */
  function handleToggle(courseId: number) {
    setSelectedCourses((current) =>
      current.includes(courseId)
        ? current.filter((id) => id !== courseId)
        : [...current, courseId]
    );
  }

  /* =========================
     Submit
  ========================= */
  async function handleSubmit() {
    setErrorMessage("");

    if (!termId) {
      setErrorMessage("يرجى اختيار الفصل الأكاديمي.");
      return;
    }

    if (selectedCourses.length === 0) {
      setErrorMessage("يرجى اختيار مادة واحدة على الأقل.");
      return;
    }

    if (studentId === null) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setSubmitting(true);

      await createWishList({
        studentID: studentId,
        academicTermID: Number(termId),
        coursesIDs: selectedCourses,
      });

      navigate("/wishlists", { replace: true });
    } catch (err) {
      console.error("Failed to create wish list:", err);
      setErrorMessage("تعذر إنشاء القائمة. حاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="wlc-page">

      {/* Header */}
      <header className="wlc-header">
        <button
          type="button"
          className="wlc-back-btn"
          onClick={() => navigate("/wishlists")}
          aria-label="رجوع"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        <div>
          <h1 className="wlc-title">إنشاء قائمة جديدة</h1>
          <p className="wlc-subtitle">
            اختر الفصل والمواد لبناء قائمتك
          </p>
        </div>
      </header>

      {/* Error */}
      {errorMessage && (
        <div className="wlc-alert-error">{errorMessage}</div>
      )}

      {/* Content */}
      <div className="wlc-content">

        {/* Term */}
        <section className="wlc-section">
          <div className="wlc-section-header">
            <span className="wlc-step">1</span>
            <div>
              <h2 className="wlc-section-title">الفصل الأكاديمي</h2>
              <p className="wlc-section-subtitle">
                اختر الفصل الذي تريد التخطيط له
              </p>
            </div>
          </div>

          <TermSelector
            value={termId}
            onChange={setTermId}
            disabled={submitting}
          />
        </section>

        {/* Courses */}
        <section className="wlc-section">
          <div className="wlc-section-header">
            <span className="wlc-step">2</span>
            <div>
              <h2 className="wlc-section-title">اختر المواد</h2>
              <p className="wlc-section-subtitle">
                {selectedCourses.length > 0
                  ? `${selectedCourses.length} مادة مختارة`
                  : "اختر مادة أو أكثر من خطتك"}
              </p>
            </div>
          </div>

          <CourseList
            items={items}
            selectedIds={selectedCourses}
            onToggle={handleToggle}
            loading={loading}
          />
        </section>

      </div>

      {/* Footer */}
      <footer className="wlc-footer">
        <div className="wlc-footer-info">
          <span className="wlc-footer-label">المواد المختارة:</span>
          <span className="wlc-footer-count">
            {selectedCourses.length}
          </span>
        </div>

        <div className="wlc-actions">
          <button
            type="button"
            className="wlc-btn wlc-btn-ghost"
            onClick={() => navigate("/wishlists")}
            disabled={submitting}
          >
            إلغاء
          </button>

          <button
            type="button"
            className="wlc-btn wlc-btn-primary"
            onClick={handleSubmit}
            disabled={
              submitting ||
              loading ||
              selectedCourses.length === 0 ||
              !termId
            }
          >
            {submitting ? "جاري الإنشاء..." : "إنشاء القائمة"}
          </button>
        </div>
      </footer>

    </div>
  );
}