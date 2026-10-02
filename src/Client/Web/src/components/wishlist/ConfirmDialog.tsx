import "./ConfirmDialog.css";

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
  variant?: "danger" | "primary";
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  onConfirm,
  onCancel,
  isProcessing = false,
  variant = "danger",
}: Props) {
  return (
    <div className="cd-overlay" onClick={onCancel} role="presentation">
      <div
        className="cd-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={`cd-icon cd-icon-${variant}`}>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h3 className="cd-title">{title}</h3>
        <p className="cd-message">{message}</p>

        <div className="cd-actions">
          <button
            type="button"
            className="cd-btn cd-btn-cancel"
            onClick={onCancel}
            disabled={isProcessing}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`cd-btn cd-btn-confirm cd-btn-${variant}`}
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? "جاري..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}