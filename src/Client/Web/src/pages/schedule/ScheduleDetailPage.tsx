import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getScheduleDetail } from "../../api/schedulesApi";
import type { ScheduleDetailResponse } from "../../types/schedule";
import { getStudentId } from "../../utils/session";

import ScheduleGrid from "../../components/schedule/ScheduleGrid";

import "./ScheduleDetailPage.css";

export default function ScheduleDetailPage() {
  const navigate = useNavigate();
  const { listId, scheduleNum } = useParams<{
    listId: string;
    scheduleNum: string;
  }>();

  const studentId = getStudentId();
  const parsedListId = Number(listId);
  const parsedScheduleNum = Number(scheduleNum);

  const [schedule, setSchedule] = useState<ScheduleDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  /* =========================
     Load Detail
  ========================= */
  useEffect(() => {
    async function load() {
      if (studentId === null) {
        navigate("/login", { replace: true });
        return;
      }

      if (
        !parsedListId ||
        Number.isNaN(parsedListId) ||
        !parsedScheduleNum ||
        Number.isNaN(parsedScheduleNum)
      ) {
        setErrorMessage("معرّف الجدول غير صالح.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const data = await getScheduleDetail(
          parsedListId,
          parsedScheduleNum
        );

        setSchedule(data);
      } catch (error) {
        console.error("Load detail failed:", error);
        setErrorMessage("تعذر تحميل تفاصيل الجدول.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [parsedListId, parsedScheduleNum, studentId, navigate]);

  /* =========================
     UI
  ========================= */
  return (
    <div className="sd-page">

      {/* Header */}
      <header className="sd-header">
        <button
          type="button"
          className="sd-back-btn"
          onClick={() => navigate("/schedules")}
          aria-label="رجوع"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        <div className="sd-header-content">
          <h1 className="sd-title">الجدول الدراسي</h1>
          <p className="sd-subtitle">
            {schedule
              ? `${schedule.sessions.length} جلسة هذا الأسبوع`
              : "جاري التحميل..."}
          </p>
        </div>
      </header>

      {/* Error */}
      {errorMessage && (
        <div className="sd-alert-error">{errorMessage}</div>
      )}

      {/* Loading */}
      {loading && (
        <div className="sd-loading">
          <div className="sd-spinner" />
          <p>جاري تحميل الجدول...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && schedule && schedule.sessions.length === 0 && (
        <div className="sd-empty">
          <p>لا توجد جلسات في هذا الجدول.</p>
        </div>
      )}

      {/* Grid */}
    {!loading && schedule && (
  <ScheduleGrid sessions={schedule.sessions ?? []} />
)}

    </div>
  );
}