import "./ScheduleNavigation.css";

interface Props {
  current: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  loading?: boolean;
}

export default function ScheduleNavigation({
  current,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  loading = false,
}: Props) {
  return (
    <nav className="sn-wrapper" aria-label="تصفح بين الجداول">

      {/* ✅ السابق — سهم يشير يمين → */}
      <button
        type="button"
        className="sn-btn sn-btn-prev"
        onClick={onPrev}
        disabled={!hasPrev || loading}
        aria-label="الجدول السابق"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
        <span>السابق</span>
      </button>

      {/* Indicator */}
      <div className="sn-indicator">
        <span className="sn-indicator-label">الجدول</span>
        <span className="sn-indicator-current">{current}</span>
      </div>

      {/* ✅ التالي — سهم يشير يسار ← */}
      <button
        type="button"
        className="sn-btn sn-btn-next"
        onClick={onNext}
        disabled={!hasNext || loading}
        aria-label="الجدول التالي"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        <span>التالي</span>
      </button>

    </nav>
  );
}