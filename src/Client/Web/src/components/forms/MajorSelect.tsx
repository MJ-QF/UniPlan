import { useEffect, useRef, useState } from "react";
import "./MajorSelect.css";
import type { MajorResponse } from "../../types/student";

interface Props {
  majors: MajorResponse[];
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  disabled?: boolean;
}

export default function MajorSelect({
  majors,
  value,
  onChange,
  loading = false,
  error = "",
  onRetry,
  disabled = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selectedName = majors.find((m) => String(m.majorID) === value)?.majorName;

  if (error) {
    return (
      <div className="major-error">
        <span>{error}</span>
        {onRetry && (
          <button type="button" onClick={onRetry}>
            إعادة المحاولة
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`custom-dropdown ${isOpen ? "custom-dropdown-open" : ""}`}
      ref={ref}
    >
      <button
        type="button"
        className={`custom-dropdown-trigger ${selectedName ? "has-value" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={loading || disabled}
      >
        <span className="custom-dropdown-value">
          {loading ? "جاري التحميل..." : selectedName ?? "اختر الاختصاص"}
        </span>
        <svg
          className="custom-dropdown-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <ul className="custom-dropdown-menu">
          {majors.map((major) => {
            const isSelected = String(major.majorID) === value;
            return (
              <li key={major.majorID}>
                <button
                  type="button"
                  className={`custom-dropdown-item ${isSelected ? "is-selected" : ""}`}
                  onClick={() => {
                    onChange(String(major.majorID));
                    setIsOpen(false);
                  }}
                >
                  <span>{major.majorName}</span>
                  {isSelected && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}