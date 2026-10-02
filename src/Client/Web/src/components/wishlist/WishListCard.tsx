import type { WishListResponse } from "../../types/wishList";
import "./WishListCard.css";

interface Props {
  wishList: WishListResponse;
  onOpen: () => void;
  onDelete: () => void;
}

export default function WishListCard({
  wishList,
  onOpen,
  onDelete,
}: Props) {
  const term = wishList.registrationInfo?.academicTerm;

  const termLabel = term
    ? `${getTermTypeLabel(term.termType)} — ${term.termYear}`
    : "فصل غير محدد";

  return (
    <article className="wl-card">

      {/* Header */}
      <div className="wl-card-header">
        <div className="wl-card-term">
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
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{termLabel}</span>
        </div>

        {/* Status Badge */}
        <span
          className={`wl-badge ${
            wishList.allowUpdate ? "wl-badge-editable" : "wl-badge-locked"
          }`}
        >
          {wishList.allowUpdate ? "قابلة للتعديل" : "للعرض فقط"}
        </span>
      </div>

      {/* Body */}
      <div className="wl-card-body">
        <p className="wl-card-desc">
          {wishList.allowUpdate
            ? "يمكنك تعديل المواد في هذه القائمة"
            : "تم بناء الجدول، لا يمكن تعديل المواد"}
        </p>
      </div>

      {/* Actions */}
      <div className="wl-card-actions">
        <button
          type="button"
          className="wl-btn wl-btn-primary"
          onClick={onOpen}
        >
          فتح القائمة
        </button>

        <button
          type="button"
          className="wl-btn wl-btn-danger"
          onClick={onDelete}
          aria-label="حذف"
        >
          <svg
            width="16"
            height="16"
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
      </div>

    </article>
  );
}

/* =========================
   Helper: Term Type Label
========================= */
function getTermTypeLabel(termType: string | null): string {
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