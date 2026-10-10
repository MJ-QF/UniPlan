import type { GeneratedScheduleResponse } from "../../types/schedule";
import "./ScheduleCard.css";

interface Props {
  schedule: GeneratedScheduleResponse;
  scheduleNumber: number;
  onOpen: () => void;
}

export default function ScheduleCard({
  schedule,
  scheduleNumber,
  onOpen,
}: Props) {
  const term = schedule.wishListInfo?.registrationInfo?.academicTerm;

  const termLabel = term
    ? `${formatTermType(term.termType)} — ${term.termYear}`
    : "فصل غير محدد";

  return (
    <article className="sc-card">

      <header className="sc-header">
        <span className="sc-number-badge">
          {scheduleNumber}
        </span>

        <div className="sc-term">
          <svg
            className="sc-term-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{termLabel}</span>
        </div>
      </header>

      <div className="sc-body">
        <p className="sc-label">رقم الجدول</p>
        <p className="sc-value">الجدول #{scheduleNumber}</p>
      </div>

      <button
        type="button"
        className="sc-open-btn"
        onClick={onOpen}
      >
        عرض الجدول
      </button>

    </article>
  );
}

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