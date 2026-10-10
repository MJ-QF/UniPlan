import "./TimeRangeInput.css";

interface Props {
  startTime: string;
  endTime: string;
  onStartChange: (time: string) => void;
  onEndChange: (time: string) => void;
  disabled?: boolean;
}

/* خيارات الوقت كل 30 دقيقة من 07:00 إلى 20:00 */
const TIME_OPTIONS: { value: string; label: string }[] = [];

for (let h = 7; h <= 20; h++) {
  const period = h >= 12 ? "م" : "ص";
  const h12 = h % 12 || 12;
  const h12Str = String(h12).padStart(2, "0");

  TIME_OPTIONS.push({
    value: `${String(h).padStart(2, "0")}:00`,
    label: `${h12Str}:00 ${period}`,
  });

  if (h !== 20) {
    TIME_OPTIONS.push({
      value: `${String(h).padStart(2, "0")}:30`,
      label: `${h12Str}:30 ${period}`,
    });
  }
}

export default function TimeRangeInput({
  startTime,
  endTime,
  onStartChange,
  onEndChange,
  disabled = false,
}: Props) {
  const isInvalid =
    startTime && endTime && startTime >= endTime;

  return (
    <div className="tr-wrapper">

      {/* From */}
      <div className="tr-field">
        <label className="tr-label" htmlFor="startTime">
          من الساعة
        </label>
        <div className="tr-select-wrapper">
          <select
            id="startTime"
            className={`tr-select ${isInvalid ? "is-invalid" : ""}`}
            value={startTime}
            onChange={(e) => onStartChange(e.target.value)}
            disabled={disabled}
          >
            {TIME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <svg
            className="tr-select-chevron"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* Divider */}
      <span className="tr-divider" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </span>

      {/* To */}
      <div className="tr-field">
        <label className="tr-label" htmlFor="endTime">
          إلى الساعة
        </label>
        <div className="tr-select-wrapper">
          <select
            id="endTime"
            className={`tr-select ${isInvalid ? "is-invalid" : ""}`}
            value={endTime}
            onChange={(e) => onEndChange(e.target.value)}
            disabled={disabled}
          >
            {TIME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <svg
            className="tr-select-chevron"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* Error hint */}
      {isInvalid && (
        <p className="tr-error" role="alert">
          وقت البداية لازم يكون قبل وقت النهاية
        </p>
      )}

    </div>
  );
}