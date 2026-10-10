import { WEEK_DAYS } from "../../utils/scheduleConstants";
import "./WeekSelector.css";

interface Props {
  value: number[];
  onChange: (days: number[]) => void;
  disabled?: boolean;
}

export default function WeekSelector({
  value,
  onChange,
  disabled = false,
}: Props) {
  function toggleDay(day: number) {
    if (value.includes(day)) {
      onChange(value.filter((d) => d !== day));
    } else {
      onChange([...value, day].sort((a, b) => a - b));
    }
  }

  return (
    <div className="ws-wrapper" role="group" aria-label="اختر أيام الأسبوع">
      {WEEK_DAYS.map((day) => {
        const isSelected = value.includes(day.value);

        return (
          <button
            key={day.value}
            type="button"
            className={`ws-chip ${isSelected ? "is-selected" : ""}`}
            onClick={() => toggleDay(day.value)}
            disabled={disabled}
            aria-pressed={isSelected}
          >
            <span className="ws-chip-check">
              {isSelected && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
            <span className="ws-chip-label">{day.label}</span>
          </button>
        );
      })}
    </div>
  );
}