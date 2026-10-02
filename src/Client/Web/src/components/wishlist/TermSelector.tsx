import { useEffect, useState } from "react";
import { getAcademicTerms } from "../../api/academicTermApi";
import type { AcademicTermResponse } from "../../types/wishList";
import "./TermSelector.css";

interface Props {
  value: string;
  onChange: (termId: string) => void;
  disabled?: boolean;
}

export default function TermSelector({
  value,
  onChange,
  disabled = false,
}: Props) {
  const [terms, setTerms] = useState<AcademicTermResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTerms() {
    try {
      setLoading(true);
      setError("");
      const data = await getAcademicTerms();
      setTerms(data);
    } catch (err) {
      console.error("Failed to load academic terms:", err);
      setError("تعذر تحميل الفصول");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTerms();
  }, []);

  if (error) {
    return (
      <div className="ts-error">
        <span>{error}</span>
        <button type="button" onClick={loadTerms}>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="ts-wrapper">
      <select
        className="ts-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
        required
      >
        <option value="">
          {loading ? "جاري تحميل الفصول..." : "اختر الفصل"}
        </option>
        {terms.map((term) => (
          <option key={term.termID} value={term.termID}>
            {formatTerm(term)}
          </option>
        ))}
      </select>

      <svg
        className="ts-chevron"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

/* Helper: Format Term */
function formatTerm(term: AcademicTermResponse): string {
  const typeMap: Record<string, string> = {
    "1": "الفصل الأول",
    "2": "الفصل الثاني",
    "3": "الفصل الصيفي",
    Fall: "الفصل الأول",
    Spring: "الفصل الثاني",
    Summer: "الفصل الصيفي",
  };

  const type = term.termType
    ? typeMap[term.termType] ?? term.termType
    : "فصل";

  return `${type} — ${term.termYear}`;
}