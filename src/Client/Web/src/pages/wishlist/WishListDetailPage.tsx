import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getWishListById,
  getWishListItems,
  syncWishListCourses,
  deleteWishList,
} from "../../api/wishLists";
import {
  getPlanStatus,
  type PlanStatusItem,
} from "../../api/studentApi";
import { getStudentId } from "../../utils/session";

import type { WishListResponse, WishListItemResponse } from "../../types/wishList";

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
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  /* ✅ وضع التعديل — يبدأ false */
  const [isEditing, setIsEditing] = useState(false);
  const [planStatusLoaded, setPlanStatusLoaded] = useState(false);

  /* نسخة من items في وضع العرض */
  const [readOnlyItems, setReadOnlyItems] = useState<CourseListItem[]>([]);

  const [showToast, setShowToast] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  /* =========================
     Load — عرض فقط
  ========================= */
  useEffect(() => {
    async function load() {
      if (studentId === null) {
        navigate("/login", { replace: true });
        return;
      }

      if (!listId || Number.isNaN(listId)) {
        setErrorMessage("معرّف القائمة غير صالحة.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        /* ✅ فقط طلبين — بدون planStatus */
        const [listData, listItems] = await Promise.all([
          getWishListById(listId),
          getWishListItems(listId),
        ]);

        setWishList(listData);

        const currentCourseIds = listItems
          .map((li) => li.course?.courseID)
          .filter((id): id is number => id !== undefined);

        setSelectedCourses(currentCourseIds);

        /* ✅ نسخة للعرض (تُستخدم في الوضعين) */
        const displayItems: CourseListItem[] = listItems
          .filter((li) => li.course !== null)
          .map((li) => ({
            course: li.course!,
            prereqNames: [],
          }));

        setItems(displayItems);
        setReadOnlyItems(displayItems);
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
     Start Editing — عند الطلب فقط
  ========================= */
  async function handleStartEdit() {
    if (studentId === null) {
      navigate("/login", { replace: true });
      return;
    }

    /* ✅ إذا planStatus محمّلة سابقاً، لا نعيد الطلب */
    if (planStatusLoaded) {
      setIsEditing(true);
      return;
    }

    try {
      setLoadingPlan(true);
      setErrorMessage("");

      /* ✅ الآن فقط نجيب planStatus */
      const planItems: PlanStatusItem[] = await getPlanStatus(studentId);

      /* خريطة code → name */
      const codeToName = new Map<string, string>();
      planItems.forEach((item) => {
        if (item.course.courseCode) {
          codeToName.set(
            item.course.courseCode,
            item.course.courseName
          );
        }
      });

      /* بناء قائمة كاملة */
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
      setPlanStatusLoaded(true);
      setIsEditing(true);
    } catch (error) {
      console.error("Failed to load plan status:", error);
      setErrorMessage("تعذر تحميل المواد للتعديل.");
    } finally {
      setLoadingPlan(false);
    }
  }

  /* =========================
     Cancel Editing — رجوع لوضع العرض
  ========================= */
  function handleCancelEdit() {
    setIsEditing(false);
    /* نرجع للقائمة الأصلية (المواد المختارة) */
    setItems(readOnlyItems);

    /* نرجع الاختيارات للمواد الأصلية */
    const originalIds = readOnlyItems.map((item) => item.course.courseID);
    setSelectedCourses(originalIds);
  }

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

      /* ✅ نرجع للوضع العرض + نحدّث readOnlyItems */
      setShowToast(true);
      setIsEditing(false);

      /* إعادة جلب المواد المحدثة */
      const refreshed = await getWishListItems(listId);
      const displayItems: CourseListItem[] = refreshed
        .filter((li) => li.course !== null)
        .map((li) => ({
          course: li.course!,
          prereqNames: [],
        }));

      setItems(displayItems);
      setReadOnlyItems(displayItems);
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

  /* =========================
     Split Items — فقط في وضع التعديل
  ========================= */
  const selectedItems = isEditing
    ? items.filter((item) => selectedCourses.includes(item.course.courseID))
    : items;

  const availableItems = isEditing
    ? items.filter((item) => !selectedCourses.includes(item.course.courseID))
    : [];

  /* =========================
     UI
  ========================= */
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
            {!allowUpdate
              ? "تم بناء الجدول — لا يمكن تعديل المواد"
              : isEditing
              ? "وضع التعديل — اختر أو أزل المواد"
              : "قائمة قيد الإعداد — يمكنك التعديل"}
          </p>
        </div>

        {/* ✅ زر "تعديل" — يظهر فقط إذا allowUpdate وليس في وضع التعديل */}
        {allowUpdate && !isEditing && (
          <button
            type="button"
            className="wld-edit-btn"
            onClick={handleStartEdit}
            disabled={loadingPlan || loading}
          >
            {loadingPlan ? (
              "جاري التحميل..."
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                تعديل
              </>
            )}
          </button>
        )}

        {/* ✅ زر "إلغاء" — يظهر فقط في وضع التعديل */}
        {isEditing && (
          <button
            type="button"
            className="wld-cancel-btn"
            onClick={handleCancelEdit}
            disabled={saving}
          >
            إلغاء
          </button>
        )}

        <button
          type="button"
          className="wld-delete-btn"
          onClick={() => setShowDeleteDialog(true)}
          disabled={deleting || isEditing}
          aria-label="حذف القائمة"
        >
          <svg
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

      {/* Read-only notice (لما allowUpdate=false) */}
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

          {/* =========================
              وضع العرض (Read-only)
          ========================= */}
          {!isEditing && (
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
                onToggle={() => {}}
                enableScroll={false}
                emptyMessage="لا توجد مواد في هذه القائمة."
              />
            </section>
          )}

          {/* =========================
              وضع التعديل (Edit)
          ========================= */}
          {isEditing && (
            <>
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
                    onToggle={handleToggle}
                    enableScroll={false}
                  />
                </section>
              )}

              {selectedItems.length > 0 && availableItems.length > 0 && (
                <div className="wld-divider" />
              )}

              {availableItems.length > 0 && (
                <section className="wld-section">
                  <header className="wld-section-header">
                    <h2 className="wld-section-title">المواد المتاحة</h2>
                    <span className="wld-section-count">
                      {availableItems.length}
                    </span>
                  </header>

                  <CourseList
                    items={availableItems}
                    selectedIds={selectedCourses}
                    onToggle={handleToggle}
                    enableScroll={false}
                  />
                </section>
              )}

              {selectedItems.length === 0 && availableItems.length === 0 && (
                <div className="wld-empty">
                  <p>لا توجد مواد في هذه القائمة.</p>
                </div>
              )}
            </>
          )}

        </div>
      )}

      {/* Save Footer — فقط في وضع التعديل */}
      {!loading && isEditing && (
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

      {/* Delete Dialog */}
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
    الثاني: "الفصل الثاني",
    الأول: "الفصل الأول",
    الصيفي: "الفصل الصيفي",
  };

  return map[termType] ?? termType;
}