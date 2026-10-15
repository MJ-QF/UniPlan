import { useEffect, useState } from "react";
import { getAcademicTerms } from "../../api/academicTermApi";
import type { AcademicTermResponse } from "../../types/wishList";
import "./CourseOfferingFilters.css";

export interface OfferingFilterValues {
  termID?: number;
  courseName?: string;
}

interface Props {
  value: OfferingFilterValues;
  onChange: (filters: OfferingFilterValues) => void;
  disabled?: boolean;
}

export default function CourseOfferingFilters({
  value,
  onChange,
  disabled = false,
}: Props) {
  const [terms, setTerms] = useState<AcademicTermResponse[]>([]);
  const [loadingTerms, setLoadingTerms] = useState(true);

  const [searchInput, setSearchInput] = useState(value.courseName ?? "");

  /* Load Terms */
  useEffect(() => {
    async function load() {
      try {
        setLoadingTerms(true);
        const data = await getAcademicTerms();
        setTerms(data);
      } catch (error) {
        console.error("Failed to load terms:", error);
      } finally {
        setLoadingTerms(false);
      }
    }
    load();
  }, []);

  /* Debounce search */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (value.courseName ?? "")) {
        onChange({ ...value, courseName: searchInput.trim() || undefined });
      }
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  /* Reset */
  function handleReset() {
    setSearchInput("");
    onChange({});
  }

  const hasFilters = !!(value.termID || value.courseName);

  return (
    <div className="cof-wrapper">

      {/* Term Select */}
      <div className="cof-field">
        <label className="cof-label" htmlFor="filter-term">
          الفصل
        </label>
        <div className="cof-select-wrapper">
          <select
            id="filter-term"
            className="cof-select"
            value={value.termID ?? ""}
            onChange={(e) =>
              onChange({
                ...value,
                termID: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            disabled={disabled || loadingTerms}
          >
            <option value="">
              {loadingTerms ? "جاري التحميل..." : "كل الفصول"}
            </option>
            {terms.map((term) => (
              <option key={term.termID} value={term.termID}>
                {formatTermType(term.termType)} — {term.termYear}
              </option>
            ))}
          </select>
          <svg
            className="cof-chevron"
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

      {/* Search */}
      <div className="cof-field cof-field-grow">
        <label className="cof-label" htmlFor="filter-search">
          اسم المقرر
        </label>
        <div className="cof-input-wrapper">
          <input
            id="filter-search"
            type="text"
            className="cof-input"
            placeholder="ابحث باسم المقرر..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            disabled={disabled}
          />
          <svg
            className="cof-search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      {/* Reset */}
      {hasFilters && (
        <button
          type="button"
          className="cof-reset-btn"
          onClick={handleReset}
          disabled={disabled}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          مسح
        </button>
      )}

    </div>
  );
}

/* =========================
   Helper
========================= */
function formatTermType(termType: string | null): string {
  if (!termType) return "فصل";

  const map: Record<string, string> = {
    "1": "الفصل الأول",
    "2": "الفصل الثاني",
    "3": "الفصل الصيفي",
    Fall: "الفصل الأول",
    Spring: "الفصل الثاني",
    Summer: "الفصل الصيفي",
    الأول: "الفصل الأول",
    الثاني: "الفصل الثاني",
    الصيفي: "الفصل الصيفي",
  };

  return map[termType] ?? termType;
}