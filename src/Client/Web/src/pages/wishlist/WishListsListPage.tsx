import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getStudentWishLists, deleteWishList } from "../../api/wishLists";import type { WishListResponse } from "../../types/wishList";
import { getStudentId } from "../../utils/session";

import WishListCard from "../../components/wishlist/WishListCard";
import ConfirmDialog from "../../components/wishlist/ConfirmDialog";

import "./WishListsListPage.css";

export default function WishListsListPage() {
  const navigate = useNavigate();
  const studentId = getStudentId();

  const [wishLists, setWishLists] = useState<WishListResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* =========================
     Load Wish Lists
  ========================= */
  async function loadWishLists() {
    if (studentId === null) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getStudentWishLists(studentId);
      setWishLists(data);
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
     Delete Wish List
  ========================= */
  async function handleConfirmDelete() {
    if (pendingDeleteId === null) return;

    try {
      setDeleting(true);
      setErrorMessage("");
      setSuccessMessage("");

      await deleteWishList(pendingDeleteId);

      // إزالة من القائمة محلياً
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

      {/* Lists */}
      {!loading && wishLists.length > 0 && (
        <div className="wl-grid">
          {wishLists.map((wishList) => (
            <WishListCard
              key={wishList.wishListID}
              wishList={wishList}
              onOpen={() => navigate(`/wishlists/${wishList.wishListID}`)}
              onDelete={() => setPendingDeleteId(wishList.wishListID)}
            />
          ))}
        </div>
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

    </div>
  );
}