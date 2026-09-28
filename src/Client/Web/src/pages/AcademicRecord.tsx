import { useEffect, useState } from "react";

import {
  getStudentCourses,
  saveStudentCourses,
} from "../api/academicRecordApi";

import type { Course } from "../api/academicRecordApi";

import "./AcademicRecord.css";

export default function AcademicRecord() {
  const [courses, setCourses] = useState<Course[]>([]);
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
      try {
        setLoading(true);
        setErrorMessage("");

        const data = await getStudentCourses();

        setCourses(data);
      } catch (error) {
        setErrorMessage("تعذر تحميل المواد.");
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

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

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      /*
    
      */
      const studentId = 1;

      await saveStudentCourses(
        studentId,
        selectedCourses
      );

      setSuccessMessage("تم حفظ المواد بنجاح.");

      /*
        لاحقًا هنا ننتقل إلى Home
        باستخدام React Router.
      */

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
                selectedCourses.includes(course.courseId);

              return (
                <button
                  key={course.courseId}
                  type="button"
                  className={`course-card ${
                    isSelected ? "selected" : ""
                  }`}
                  onClick={() =>
                    handleCourseSelection(course.courseId)
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