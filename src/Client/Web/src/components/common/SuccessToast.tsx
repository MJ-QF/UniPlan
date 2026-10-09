import { useEffect } from "react";
import "./SuccessToast.css";

interface Props {
  show: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function SuccessToast({
  show,
  message,
  onClose,
  duration = 2500,
}: Props) {
  useEffect(() => {
    if (!show) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div className="toast-wrapper" role="status" aria-live="polite">
      <div className="toast toast-success">
        <div className="toast-icon">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <span className="toast-message">{message}</span>

        <button
          type="button"
          className="toast-close"
          onClick={onClose}
          aria-label="إغلاق"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}