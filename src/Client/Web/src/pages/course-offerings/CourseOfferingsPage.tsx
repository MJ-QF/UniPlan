import { useEffect, useState } from "react";

import {
  getCourseOfferings,
  createCourseOffering,
  updateCourseOffering,
  deleteCourseOffering,
} from "../../api/courseOfferingsApi";
import type { CourseOfferingResponse } from "../../types/courseOffering";

import { getAdminId, isAdmin } from "../../utils/session";

import CourseOfferingCard from "../../components/course-offerings/CourseOfferingCard";
import CourseOfferingFilters, {
  type OfferingFilterValues,
} from "../../components/course-offerings/CourseOfferingFilters";
import CreateCourseOfferingDialog from "../../components/course-offerings/CreateCourseOfferingDialog";
import EditCourseOfferingDialog from "../../components/course-offerings/EditCourseOfferingDialog";
import ConfirmDialog from "../../components/wishlist/ConfirmDialog";
import SuccessToast from "../../components/common/SuccessToast";
import EmptyState from "../../components/schedule/EmptyState";

import "./CourseOfferingsPage.css";

const PAGE_SIZE = 10;

export default function CourseOfferingsPage() {
  const adminMode = isAdmin();
  const adminId = getAdminId();

  /* =========================
     State
  ========================= */
  const [offerings, setOfferings] = useState<CourseOfferingResponse[]>([]);
  const [filters, setFilters] = useState<OfferingFilterValues>({});

  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /* Dialogs */
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [editingOffering, setEditingOffering] =
    useState<CourseOfferingResponse | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  /* =========================
     Load — أولي أو بحث
  ========================= */
  useEffect(() => {
    async function load() {
      try {
        /* ✅ أول تحميل → skeleton */
        if (isFirstLoad) {
          setLoading(true);
        } else {
          /* ✅ بحث → مؤشر خفيف بدون skeleton */
          setSearching(true);
        }

        setErrorMessage("");

        const data = await getCourseOfferings({
          termID: filters.termID,
          courseName: filters.courseName,
          pageNumber: 1,
          pageSize: PAGE_SIZE,
        });

        setOfferings(data);
        setPageNumber(1);
        setHasMore(data.length === PAGE_SIZE);
      } catch (error: any) {
        console.error("Load offerings failed:", error);
        setErrorMessage(
          error?.response?.data ?? "تعذر تحميل الشعب الدراسية."
        );
      } finally {
        setLoading(false);
        setSearching(false);
        setIsFirstLoad(false);
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  /* =========================
     Load More
  ========================= */
  async function handleLoadMore() {
    try {
      setLoadingMore(true);
      setErrorMessage("");

      const nextPage = pageNumber + 1;
      const data = await getCourseOfferings({
        termID: filters.termID,
        courseName: filters.courseName,
        pageNumber: nextPage,
        pageSize: PAGE_SIZE,
      });

      setOfferings((current) => [...current, ...data]);
      setPageNumber(nextPage);
      setHasMore(data.length === PAGE_SIZE);
    } catch (error: any) {
      console.error("Load more failed:", error);
      setErrorMessage(error?.response?.data ?? "تعذر تحميل المزيد.");
    } finally {
      setLoadingMore(false);
    }
  }

  /* =========================
     Refresh
  ========================= */
  async function refreshOfferings() {
    try {
      const data = await getCourseOfferings({
        termID: filters.termID,
        courseName: filters.courseName,
        pageNumber: 1,
        pageSize: PAGE_SIZE * pageNumber,
      });

      setOfferings(data);
      setHasMore(data.length === PAGE_SIZE * pageNumber);
    } catch (error) {
      console.error("Refresh failed:", error);
    }
  }

  /* =========================
     Create
  ========================= */
  async function handleCreate(data: {
    courseID: number;
    termID: number;
    lectureType: number;
    numberOfSections: number;
  }) {
    if (adminId === null) {
      setCreateError("معرف الإداري غير متوفر.");
      return;
    }

    try {
      setCreating(true);
      setCreateError("");

      await createCourseOffering({
        ...data,
        createdByAdminID: adminId,
      });

      setShowCreateDialog(false);
      await refreshOfferings();

      setToastMessage("تم إنشاء الشعب بنجاح");
      setShowToast(true);
    } catch (error: any) {
      console.error("Create failed:", error);
      setCreateError(
        error?.response?.data ?? "تعذر إنشاء الشعب. حاول مرة أخرى."
      );
    } finally {
      setCreating(false);
    }
  }

  /* =========================
     Update
  ========================= */
  async function handleUpdate(data: {
    sectionNumber: number;
    termID: number;
    lectureID: number;
  }) {
    if (!editingOffering) return;

    try {
      setUpdating(true);
      setUpdateError("");

      await updateCourseOffering(editingOffering.offeringID, {
        ...data,
        courseID: editingOffering.lectureInfo.courseInfo.courseID,
      });

      setEditingOffering(null);
      await refreshOfferings();

      setToastMessage("تم حفظ التعديلات بنجاح");
      setShowToast(true);
    } catch (error: any) {
      console.error("Update failed:", error);
      setUpdateError(error?.response?.data ?? "تعذر حفظ التعديلات.");
    } finally {
      setUpdating(false);
    }
  }

  /* =========================
     Delete
  ========================= */
  async function handleConfirmDelete() {
    if (pendingDeleteId === null) return;

    try {
      setDeleting(true);
      setErrorMessage("");

      await deleteCourseOffering(pendingDeleteId);

      setOfferings((current) =>
        current.filter((o) => o.offeringID !== pendingDeleteId)
      );
      setPendingDeleteId(null);

      setSuccessMessage("تم حذف الشعبة بنجاح.");
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (error: any) {
      console.error("Delete failed:", error);
      setErrorMessage(error?.response?.data ?? "تعذر حذف الشعبة.");
      setPendingDeleteId(null);
    } finally {
      setDeleting(false);
    }
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="cop-page">

      {/* Header */}
      <header className="cop-header">
        <div>
          <h1 className="cop-title">الشعب الدراسية</h1>
          <p className="cop-subtitle">
            {adminMode
              ? "أضف وعدّل واحذف الشعب الدراسية"
              : "استعرض الشعب الدراسية المتاحة"}
          </p>
        </div>

        {adminMode && (
          <button
            type="button"
            className="cop-create-btn"
            onClick={() => setShowCreateDialog(true)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            إضافة شعب
          </button>
        )}
      </header>

      {/* Filters */}
      <CourseOfferingFilters
        value={filters}
        onChange={(v) => setFilters(v)}
        disabled={loading}
        isSearching={searching}
      />

      {/* Alerts */}
      {errorMessage && (
        <div className="cop-alert-error">{errorMessage}</div>
      )}
      {successMessage && (
        <div className="cop-alert-success">{successMessage}</div>
      )}

      {/* Loading (أول تحميل فقط) */}
      {loading && isFirstLoad && (
        <div className="cop-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="cop-skeleton" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && offerings.length === 0 && !errorMessage && (
        <EmptyState
          title="لا توجد شعب دراسية"
          message={
            adminMode
              ? "ابدأ بإضافة شعبة جديدة."
              : "لا توجد شعب متاحة حالياً."
          }
          actionLabel={adminMode ? "إضافة شعبة" : undefined}
          onAction={adminMode ? () => setShowCreateDialog(true) : undefined}
        />
      )}

      {/* Grid — مع تأثير ناعم عند البحث */}
      {!loading && offerings.length > 0 && (
        <>
          <div className={`cop-grid ${searching ? "is-searching" : ""}`}>
            {offerings.map((offering) => (
              <CourseOfferingCard
                key={offering.offeringID}
                offering={offering}
                onEdit={
                  adminMode
                    ? () => setEditingOffering(offering)
                    : () => {}
                }
                onDelete={
                  adminMode
                    ? () => setPendingDeleteId(offering.offeringID)
                    : () => {}
                }
              />
            ))}
          </div>

          {hasMore && (
            <div className="cop-load-more-wrapper">
              <button
                type="button"
                className="cop-load-more"
                onClick={handleLoadMore}
                disabled={loadingMore || searching}
              >
                {loadingMore ? "جاري التحميل..." : "عرض المزيد"}
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Dialog */}
      {showCreateDialog && adminId !== null && (
        <CreateCourseOfferingDialog
          adminId={adminId}
          isLoading={creating}
          serverError={createError}
          onSubmit={handleCreate}
          onCancel={() => {
            setShowCreateDialog(false);
            setCreateError("");
          }}
        />
      )}

      {/* Edit Dialog */}
      {editingOffering && (
        <EditCourseOfferingDialog
          offering={editingOffering}
          isLoading={updating}
          serverError={updateError}
          onSubmit={handleUpdate}
          onCancel={() => {
            setEditingOffering(null);
            setUpdateError("");
          }}
        />
      )}

      {/* Delete Confirm */}
      {pendingDeleteId !== null && (
        <ConfirmDialog
          title="حذف الشعبة"
          message="هل أنت متأكد من حذف هذه الشعبة؟ لا يمكن التراجع عن هذا الإجراء."
          confirmLabel={deleting ? "جاري الحذف..." : "حذف"}
          cancelLabel="إلغاء"
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDeleteId(null)}
          isProcessing={deleting}
        />
      )}

      {/* Toast */}
      <SuccessToast
        show={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
      />

    </div>
  );
}