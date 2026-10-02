import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getMajorCourses,
  saveStudentCourses,
} from "../api/academicRecordApi";

import type { CourseResponse } from "../types/course";
import { getStudentId } from "../utils/session";

import "./AcademicRecord.css";

export default function AcademicRecord() {
  const navigate = useNavigate();
  const studentId = getStudentId();

  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /*
    عند فتح الصفحة:
    1. نجلب المواد من الـAPI
    2. نخزنها في courses
  */
  useEffect(() => {
    async function loadCourses() {
      if (studentId === null) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const data = await getMajorCourses(studentId);

        setCourses(data);
      } catch (error) {
        setErrorMessage("تعذر تحميل المواد.");
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, [studentId, navigate]);

  /*
    اختيار / إلغاء اختيار مادة
  */
  function handleCourseSelection(courseId: number) {
    setSelectedCourses((currentSelected) => {
      if (currentSelected.includes(courseId)) {
        return currentSelected.filter((id) => id !== courseId);
      }

      return [...currentSelected, courseId];
    });
  }

  /*
    حفظ المواد المختارة
  */
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

      await saveStudentCourses(
        studentId,
        selectedCourses
      );

setSuccessMessage("تم حفظ المواد بنجاح.");

// ✅ انتقال تلقائي بعد الحفظ
setTimeout(() => {
  navigate("/wishlists", { replace: true });
}, 800);
      // لاحقًا: navigate("/home") لما نبني صفحة Home

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

          <div className="academic-logo">
            UniPlan
          </div>

          <h1>
            اختر المواد التي درستها
          </h1>

          <p>
            حدد المواد التي سبق لك دراستها حتى نتمكن من
            مساعدتك في بناء خطتك الأكاديمية.
          </p>

        </div>


        {/* Error */}

        {errorMessage && (
          <div className="academic-alert-error">
            {errorMessage}
          </div>
        )}


        {/* Success */}

        {successMessage && (
          <div className="academic-alert-success">
            {successMessage}
          </div>
        )}


        {/* Loading */}

        {loading && (
          <div className="academic-loading">
            جاري تحميل المواد...
          </div>
        )}


        {/* Courses */}

        {!loading && courses.length > 0 && (

          <div className="courses-list">

            {courses.map((course) => {

              const isSelected =
                selectedCourses.includes(course.courseID);

              return (
                <button
                  key={course.courseID}
                  type="button"
                  className={`course-card ${
                    isSelected ? "selected" : ""
                  }`}
                  onClick={() =>
                    handleCourseSelection(course.courseID)
                  }
                >

                  <div className="course-check">

                    {isSelected && "✓"}

                  </div>


                  <div className="course-info">

                    <h3>
                      {course.courseName}
                    </h3>

                    <div className="course-details">

                      <span>
                        {course.courseCode}
                      </span>

                      <span>
                        {course.creditHours} ساعات
                      </span>

                    </div>

                  </div>

                </button>
              );
            })}

          </div>
        )}


        {/* No Courses */}

        {!loading && courses.length === 0 && !errorMessage && (
          <div className="academic-empty">
            لا توجد مواد متاحة حاليًا.
          </div>
        )}


        {/* Continue */}

        {!loading && courses.length > 0 && (

          <button
            type="button"
            className="continue-btn"
            onClick={handleContinue}
            disabled={saving}
          >

            {saving
              ? "جاري الحفظ..."
              : "متابعة"}

          </button>

        )}

      </div>

    </div>
  );
}