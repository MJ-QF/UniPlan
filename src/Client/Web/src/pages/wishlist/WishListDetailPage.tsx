import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getWishListById,
  getWishListItems,
  syncWishListCourses,
  deleteWishList,
} from "../../api/wishLists";
import { getPlanStatus } from "../../api/studentApi";
import { getStudentId } from "../../utils/session";

import type { WishListResponse } from "../../types/wishList";

import CourseList, {
  type CourseListItem,
} from "../../components/courses/CourseList";
import SuccessToast from "../../components/common/SuccessToast";
import ConfirmDialog from "../../components/wishlist/ConfirmDialog";

import "./WishListDetailPage.css";

export default function WishListDetailPage() {
  const navigate = useNavigate();
  const { wishListId } = useParams<{ wishListId: string }>();

  const studentId = getStudentId();
  const listId = Number(wishListId);

  const [wishList, setWishList] = useState<WishListResponse | null>(null);
  const [items, setItems] = useState<CourseListItem[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [showToast, setShowToast] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  /* =========================
     Load
  ========================= */
  useEffect(() => {
    async function load() {
      if (studentId === null) {
        navigate("/login", { replace: true });
        return;
      }

      if (!listId || Number.isNaN(listId)) {
        setErrorMessage("معرّف القائمة غير صالح.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const [listData, listItems, planItems] = await Promise.all([
          getWishListById(listId),
          getWishListItems(listId),
          getPlanStatus(studentId),
        ]);

        setWishList(listData);

        const codeToName = new Map<string, string>();
        planItems.forEach((item) => {
          if (item.course.courseCode) {
            codeToName.set(
              item.course.courseCode,
              item.course.courseName
            );
          }
        });

        const currentCourseIds = listItems
          .map((li) => li.course?.courseID)
          .filter((id): id is number => id !== undefined);

        setSelectedCourses(currentCourseIds);

        /* ✅ allowUpdate = false → عرض فقط */
        if (!listData.allowUpdate) {
          const onlyItems: CourseListItem[] = listItems
            .filter((li) => li.course !== null)
            .map((li) => ({
              course: li.course!,
              prereqNames: [],
            }));

          setItems(onlyItems);
          setLoading(false);
          return;
        }

        /* ✅ allowUpdate = true → كل مواد الخطة */
        const built: CourseListItem[] = planItems.map((item) => {
          const prereqNames = (
            item.coursePrerequisitesCodes ?? []
          ).map((code) => codeToName.get(code) ?? code);

          return {
            course: item.course,
            prereqNames,
          };
        });

        setItems(built);
      } catch (error) {
        console.error("Load failed:", error);
        setErrorMessage("تعذر تحميل القائمة.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [listId, studentId, navigate]);

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
     Save
  ========================= */
  async function handleSave() {
    if (selectedCourses.length === 0) {
      setErrorMessage("يرجى اختيار مادة واحدة على الأقل.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      await syncWishListCourses(listId, {
        courseIds: selectedCourses,
      });

      setShowToast(true);
    } catch (error) {
      console.error("Save failed:", error);
      setErrorMessage("تعذر حفظ التعديلات.");
    } finally {
      setSaving(false);
    }
  }

  /* =========================
     Delete
  ========================= */
  async function handleConfirmDelete() {
    try {
      setDeleting(true);
      setErrorMessage("");

      await deleteWishList(listId);

      navigate("/wishlists", { replace: true });
    } catch (error) {
      console.error("Delete failed:", error);
      setErrorMessage("تعذر حذف القائمة.");
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  }

  /* =========================
     Labels
  ========================= */
  const term = wishList?.registrationInfo?.academicTerm;
  const termLabel = term
    ? `${formatTermType(term.termType)} — ${term.termYear}`
    : "قائمة الرغبات";

  const allowUpdate = wishList?.allowUpdate ?? false;

  /* ✅ التقسيم */
  const selectedItems = items.filter((item) =>
    selectedCourses.includes(item.course.courseID)
  );

  const availableItems = items.filter(
    (item) => !selectedCourses.includes(item.course.courseID)
  );

  return (
    <div className="wld-page">

      {/* Header */}
      <header className="wld-header">
        <button
          type="button"
          className="wld-back-btn"
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

        <div className="wld-header-content">
          <h1 className="wld-title">{termLabel}</h1>
          <p className="wld-subtitle">
            {allowUpdate
              ? "قائمة قيد الإعداد — يمكنك تعديل المواد ثم إنشاء الجدول"
              : "تم بناء الجدول — يمكنك عرضه فقط"}
          </p>
        </div>

        <button
          type="button"
          className="wld-delete-btn"
          onClick={() => setShowDeleteDialog(true)}
          disabled={deleting}
          aria-label="حذف القائمة"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </header>

      {/* Error */}
      {errorMessage && (
        <div className="wld-alert-error">{errorMessage}</div>
      )}

      {/* Read-only notice */}
      {!loading && !allowUpdate && (
        <div className="wld-notice">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>
            تم بناء الجدول الدراسي لهذه القائمة. لا يمكن تعديل المواد.
          </span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="wld-loading">
          <div className="wld-spinner" />
          <p>جاري تحميل القائمة...</p>
        </div>
      )}

      {/* Content */}
      {!loading && (
        <div className="wld-content">

          {/* Selected */}
          {selectedItems.length > 0 && (
            <section className="wld-section">
              <header className="wld-section-header">
                <h2 className="wld-section-title">المواد المختارة</h2>
                <span className="wld-section-count wld-count-primary">
                  {selectedItems.length}
                </span>
              </header>

              <CourseList
                items={selectedItems}
                selectedIds={selectedCourses}
                onToggle={allowUpdate ? handleToggle : () => {}}
                enableScroll={false}
              />
            </section>
          )}

          {/* Divider */}
          {selectedItems.length > 0 && availableItems.length > 0 && (
            <div className="wld-divider" />
          )}

          {/* Available */}
          {availableItems.length > 0 && (
            <section className="wld-section">
              <header className="wld-section-header">
                <h2 className="wld-section-title">
                  {allowUpdate ? "المواد المتاحة" : "باقي المواد"}
                </h2>
                <span className="wld-section-count">
                  {availableItems.length}
                </span>
              </header>

              <CourseList
                items={availableItems}
                selectedIds={selectedCourses}
                onToggle={allowUpdate ? handleToggle : () => {}}
                enableScroll={false}
              />
            </section>
          )}

          {/* Empty */}
          {selectedItems.length === 0 && availableItems.length === 0 && (
            <div className="wld-empty">
              <p>لا توجد مواد في هذه القائمة.</p>
            </div>
          )}

        </div>
      )}

      {/* Save Footer */}
      {!loading && allowUpdate && items.length > 0 && (
        <footer className="wld-footer">
          <button
            type="button"
            className="wld-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </footer>
      )}

      {/* Toast */}
      <SuccessToast
        show={showToast}
        message="تم حفظ التعديلات بنجاح"
        onClose={() => setShowToast(false)}
      />

      {/* Delete */}
      {showDeleteDialog && (
        <ConfirmDialog
          title="حذف القائمة"
          message="هل أنت متأكد من حذف هذه القائمة؟ لا يمكن التراجع عن هذا الإجراء."
          confirmLabel={deleting ? "جاري الحذف..." : "حذف"}
          cancelLabel="إلغاء"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteDialog(false)}
          isProcessing={deleting}
        />
      )}

    </div>
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
  };

  return map[termType] ?? termType;
}