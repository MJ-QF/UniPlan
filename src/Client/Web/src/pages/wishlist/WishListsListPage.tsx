import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getStudentWishLists, deleteWishList } from "../../api/wishLists";
import { createSchedule } from "../../api/schedulesApi";
import type { WishListResponse } from "../../types/wishList";
import { getStudentId } from "../../utils/session";

import WishListCard from "../../components/wishlist/WishListCard";
import ConfirmDialog from "../../components/wishlist/ConfirmDialog";
import CreateScheduleDialog from "../../components/schedule/CreateScheduleDialog";
import SuccessToast from "../../components/common/SuccessToast";

import "./WishListsListPage.css";

/* ✅ حجم الصفحة — الباك يقبل 10 كحد أقصى */
const PAGE_SIZE = 10;

export default function WishListsListPage() {
  const navigate = useNavigate();
  const studentId = getStudentId();

  const [wishLists, setWishLists] = useState<WishListResponse[]>([]);
  const [loading, setLoading] = useState(true);

  /* ✅ Pagination state */
  const [pageNumber, setPageNumber] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /* Delete */
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* Create Schedule */
  const [scheduleForWishListId, setScheduleForWishListId] =
    useState<number | null>(null);
  const [creatingSchedule, setCreatingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState("");

  const [showToast, setShowToast] = useState(false);

  /* =========================
     Load First Page
  ========================= */
  async function loadWishLists() {
    if (studentId === null) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getStudentWishLists(studentId, 1, PAGE_SIZE);

      setWishLists(data);
      setPageNumber(1);
      setHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      console.error("Failed to load wish lists:", error);
      setErrorMessage("تعذر تحميل قوائم الرغبات.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWishLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================
     Load More
  ========================= */
  async function handleLoadMore() {
    if (studentId === null) return;

    try {
      setLoadingMore(true);
      setErrorMessage("");

      const nextPage = pageNumber + 1;
      const data = await getStudentWishLists(
        studentId,
        nextPage,
        PAGE_SIZE
      );

      setWishLists((current) => [...current, ...data]);
      setPageNumber(nextPage);
      setHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      console.error("Load more failed:", error);
      setErrorMessage("تعذر تحميل المزيد.");
    } finally {
      setLoadingMore(false);
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

      await deleteWishList(pendingDeleteId);

      setWishLists((current) =>
        current.filter((w) => w.wishListID !== pendingDeleteId)
      );

      setSuccessMessage("تم حذف القائمة بنجاح.");
      setPendingDeleteId(null);

      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (error) {
      console.error("Failed to delete wish list:", error);
      setErrorMessage("تعذر حذف القائمة. حاول مرة أخرى.");
    } finally {
      setDeleting(false);
    }
  }

  /* =========================
     Create Schedule
  ========================= */
  async function handleCreateSchedule(data: {
    days: number[];
    startTime: string;
    endTime: string;
  }) {
    if (scheduleForWishListId === null) return;

    try {
      setCreatingSchedule(true);
      setScheduleError("");

      const result = await createSchedule({
        wishListID: scheduleForWishListId,
        days: data.days,
        startTime: data.startTime,
        endTime: data.endTime,
      });

      const listId = result.wishListInfo.wishListID;

      setScheduleForWishListId(null);
      setScheduleError("");

      /* ✅ refetch القوائم (يرجع للصفحة 1) */
      await loadWishLists();

      setShowToast(true);

      setTimeout(() => {
        navigate(`/schedules/${listId}/1`);
      }, 900);

    } catch (error: any) {
      console.error("Failed to create schedule:", error);

      const data = error?.response?.data;

      let message = "تعذر إنشاء الجدول. حاول مرة أخرى.";

      if (typeof data === "string" && data.trim()) {
        message = data.trim();
      } else if (data?.message) {
        message = data.message;
      } else if (error?.message) {
        message = error.message;
      }

      setScheduleError(message);
    } finally {
      setCreatingSchedule(false);
    }
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="wl-page">

      {/* Header */}
      <header className="wl-header">
        <div>
          <h1 className="wl-title">قوائم الرغبات</h1>
          <p className="wl-subtitle">
            أنشئ قوائم لموادك المفضلة وسنقوم ببناء جدولك تلقائياً
          </p>
        </div>

        <button
          type="button"
          className="wl-create-btn"
          onClick={() => navigate("/wishlists/create")}
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
          إنشاء قائمة جديدة
        </button>
      </header>

      {/* Alerts */}
      {errorMessage && (
        <div className="wl-alert-error">{errorMessage}</div>
      )}
      {successMessage && (
        <div className="wl-alert-success">{successMessage}</div>
      )}

      {/* Loading */}
      {loading && (
        <div className="wl-loading">
          <div className="wl-spinner" />
          <p>جاري تحميل القوائم...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && wishLists.length === 0 && !errorMessage && (
        <div className="wl-empty">
          <div className="wl-empty-icon">
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h4" />
            </svg>
          </div>
          <h3>لا توجد قوائم بعد</h3>
          <p>ابدأ بإنشاء قائمتك الأولى لبناء جدولك الدراسي</p>
          <button
            type="button"
            className="wl-create-btn wl-create-btn-lg"
            onClick={() => navigate("/wishlists/create")}
          >
            إنشاء أول قائمة
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && wishLists.length > 0 && (
        <>
          <div className="wl-grid">
            {wishLists.map((wishList) => (
              <WishListCard
                key={wishList.wishListID}
                wishList={wishList}
                onOpen={() => {
                  if (wishList.allowUpdate) {
                    navigate(`/wishlists/${wishList.wishListID}`);
                  } else {
                    navigate(`/schedules/${wishList.wishListID}/1`);
                  }
                }}
                onDelete={() => setPendingDeleteId(wishList.wishListID)}
                onCreateSchedule={() =>
                  setScheduleForWishListId(wishList.wishListID)
                }
                onViewSchedule={() =>
                  navigate(`/schedules/${wishList.wishListID}/1`)
                }
              />
            ))}
          </div>

          {/* ✅ Load More */}
          {hasMore && (
            <div className="wl-load-more-wrapper">
              <button
                type="button"
                className="wl-load-more-btn"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <span className="wl-btn-spinner" />
                    جاري التحميل...
                  </>
                ) : (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                    عرض المزيد
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Confirm Delete Dialog */}
      {pendingDeleteId !== null && (
        <ConfirmDialog
          title="حذف القائمة"
          message="هل أنت متأكد من حذف هذه القائمة؟ لا يمكن التراجع عن هذا الإجراء."
          confirmLabel={deleting ? "جاري الحذف..." : "حذف"}
          cancelLabel="إلغاء"
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDeleteId(null)}
          isProcessing={deleting}
        />
      )}

      {/* Create Schedule Dialog */}
      {scheduleForWishListId !== null && (
        <CreateScheduleDialog
          isLoading={creatingSchedule}
          onSubmit={handleCreateSchedule}
          onCancel={() => {
            setScheduleForWishListId(null);
            setScheduleError("");
          }}
          serverError={scheduleError}
        />
      )}

      {/* Success Toast */}
      <SuccessToast
        show={showToast}
        message="تم إنشاء الجدول بنجاح"
        onClose={() => setShowToast(false)}
      />

    </div>
  );
}