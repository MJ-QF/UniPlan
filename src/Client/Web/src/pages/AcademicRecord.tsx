import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getPlanStatus,
  getStudentCourses,
} from "../api/studentApi";
import { saveStudentCourses } from "../api/academicRecordApi";
import { getStudentId } from "../utils/session";

import CourseList, {
  type CourseListItem,
} from "../components/courses/CourseList";

import "./AcademicRecord.css";

export default function AcademicRecord() {
  const navigate = useNavigate();
  const studentId = getStudentId();

  const [items, setItems] = useState<CourseListItem[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /* =========================
     Load Courses + Passed
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

        /* ✅ جلب البيانات بالتوازي */
        const [planItems, studentCourses] = await Promise.all([
          getPlanStatus(studentId),
          getStudentCourses(studentId),
        ]);

        /* ✅ استخراج المواد المجتازة */
        const passedIds = new Set(
          studentCourses
            .filter((sc) => sc.isPassed)
            .map((sc) => sc.course.courseID)
        );

        /* ✅ بناء الـ items */
        const built: CourseListItem[] = planItems.map((item) => {
          const isPassed = passedIds.has(item.course.courseID);
          const status = item.status ?? "";

          let label: string | undefined;
          let variant: CourseListItem["statusVariant"] = "available";

          if (isPassed) {
            label = "تم اجتيازها";
            variant = "passed";
          } else if (status === "غير متاحة") {
            label = "غير متاحة";
            variant = "unavailable";
          }

          return {
            course: item.course,
            statusLabel: label,
            statusVariant: variant,
            prereqCodes: item.coursePrerequisitesCodes ?? [],
            disabled: isPassed,
          };
        });

        setItems(built);
        setSelectedCourses([...passedIds]);
      } catch (error) {
        console.error("Load failed:", error);
        setErrorMessage("تعذر تحميل المواد.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [studentId, navigate]);

  /* =========================
     Toggle Course
  ========================= */
  function handleToggle(courseId: number) {
    setSelectedCourses((current) =>
      current.includes(courseId)
        ? current.filter((id) => id !== courseId)
        : [...current, courseId]
    );
  }

  /* =========================
     Save
  ========================= */
  async function handleContinue() {
    if (selectedCourses.length === 0) {
      setErrorMessage("يرجى اختيار مادة واحدة على الأقل.");
      return;
    }

    if (studentId === null) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await saveStudentCourses(studentId, selectedCourses);

      setSuccessMessage("تم حفظ المواد بنجاح.");

      setTimeout(() => {
        navigate("/wishlists", { replace: true });
      }, 800);
    } catch (error) {
      setErrorMessage("تعذر حفظ المواد.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="academic-page">
      <div className="academic-card">

        {/* Header */}
        <div className="academic-header">
          <div className="academic-logo">UniPlan</div>

          <h1>اختر المواد التي درستها</h1>

          <p>
            حدد المواد التي سبق لك دراستها حتى نتمكن من
            مساعدتك في بناء خطتك الأكاديمية.
          </p>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="academic-alert-error">{errorMessage}</div>
        )}

        {/* Success */}
        {successMessage && (
          <div className="academic-alert-success">{successMessage}</div>
        )}

        {/* Courses */}
        <CourseList
          items={items}
          selectedIds={selectedCourses}
          onToggle={handleToggle}
          loading={loading}
          emptyMessage="لا توجد مواد متاحة حاليًا."
        />

        {/* Continue */}
        {!loading && items.length > 0 && (
          <button
            type="button"
            className="continue-btn"
            onClick={handleContinue}
            disabled={saving}
          >
            {saving ? "جاري الحفظ..." : "متابعة"}
          </button>
        )}

      </div>
    </div>
  );
}