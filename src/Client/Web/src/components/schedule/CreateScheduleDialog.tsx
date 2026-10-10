import { createPortal } from "react-dom";
import { useState } from "react";
import WeekSelector from "./WeekSelector";
import TimeRangeInput from "./TimeRangeInput";
import "./CreateScheduleDialog.css";

interface Props {
  isLoading: boolean;
  onSubmit: (data: {
    days: number[];
    startTime: string;
    endTime: string;
  }) => void;
  onCancel: () => void;
  serverError?: string;
}

export default function CreateScheduleDialog({
  isLoading,
  onSubmit,
  onCancel,
  serverError,
}: Props) {
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("16:00");
  const [localError, setLocalError] = useState("");

  function handleSubmit() {
    setLocalError("");

    if (days.length === 0) {
      setLocalError("اختر يوم واحد على الأقل");
      return;
    }

    if (startTime >= endTime) {
      setLocalError("وقت البداية لازم يكون قبل وقت النهاية");
      return;
    }

    const start = `${startTime}:00`;
    const end = `${endTime}:00`;

    onSubmit({ days, startTime: start, endTime: end });
  }

  const errorToShow = localError || serverError;

  const content = (
    <div className="csd-overlay" onClick={onCancel} role="presentation">
      <div
        className="csd-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="csd-title"
      >
        {/* Header */}
        <header className="csd-header">
          <div className="csd-header-icon">
            <svg
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
          </div>
          <div>
            <h3 id="csd-title" className="csd-title">
              إنشاء جدول جديد
            </h3>
            <p className="csd-subtitle">
              حدد الأيام والأوقات المناسبة لك
            </p>
          </div>
        </header>

        {/* Body */}
        <div className="csd-body">

          {/* Days */}
          <section className="csd-section">
            <label className="csd-label">
              الأيام
              <span className="csd-label-hint">
                ({days.length} من 5)
              </span>
            </label>
            <WeekSelector
              value={days}
              onChange={setDays}
              disabled={isLoading}
            />
          </section>

          {/* Time Range */}
          <section className="csd-section">
            <label className="csd-label">الوقت المسموح</label>
            <TimeRangeInput
              startTime={startTime}
              endTime={endTime}
              onStartChange={setStartTime}
              onEndChange={setEndTime}
              disabled={isLoading}
            />
          </section>

          {/* Error */}
          {errorToShow && (
            <div className="csd-error" role="alert">
              {errorToShow}
            </div>
          )}

        </div>

        {/* Actions */}
        <footer className="csd-actions">
          <button
            type="button"
            className="csd-btn csd-btn-ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            إلغاء
          </button>
          <button
            type="button"
            className="csd-btn csd-btn-primary"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "جاري الإنشاء..." : "إنشاء الجدول"}
          </button>
        </footer>

      </div>
    </div>
  );

  /* ✅ Portal — يرسم في document.body */
  return createPortal(content, document.body);
}