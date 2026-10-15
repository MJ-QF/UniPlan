import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getStudentSchedules } from "../../api/schedulesApi";
import type { GeneratedScheduleResponse } from "../../types/schedule";
import { getStudentId } from "../../utils/session";

import ScheduleCard from "../../components/schedule/ScheduleCard";
import EmptyState from "../../components/schedule/EmptyState";

import "./SchedulesListPage.css";

const PAGE_SIZE = 6;

export default function SchedulesListPage() {
  const navigate = useNavigate();
  const studentId = getStudentId();

  const [schedules, setSchedules] = useState<GeneratedScheduleResponse[]>([]);
  const [pageNumber, setPageNumber] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  /* =========================
     Load First Page
  ========================= */
  useEffect(() => {
    async function load() {
      if (studentId === null) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const data = await getStudentSchedules(
          studentId,
          1,
          PAGE_SIZE
        );

        setSchedules(data);
        setPageNumber(1);
        setHasMore(data.length === PAGE_SIZE);
      } catch (error) {
        console.error("Load schedules failed:", error);
        setErrorMessage("تعذر تحميل الجداول.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [studentId, navigate]);

  /* =========================
     Load More
  ========================= */
  async function handleLoadMore() {
    if (studentId === null) return;

    try {
      setLoadingMore(true);
      setErrorMessage("");

      const nextPage = pageNumber + 1;
      const data = await getStudentSchedules(
        studentId,
        nextPage,
        PAGE_SIZE
      );

      setSchedules((current) => [...current, ...data]);
      setPageNumber(nextPage);
      setHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      console.error("Load more failed:", error);
      setErrorMessage("تعذر تحميل المزيد.");
    } finally {
      setLoadingMore(false);
    }
  }

  /* =========================
     Open Schedule — دائماً الجدول الأول
  ========================= */
  function handleOpenSchedule(schedule: GeneratedScheduleResponse) {
    const listId = schedule.wishListInfo.wishListID;
    navigate(`/schedules/${listId}/1`);
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="sl-page">

      {/* Header */}
      <header className="sl-header">
        <div>
          <h1 className="sl-title">الجداول الدراسية</h1>
          <p className="sl-subtitle">
            استعرض جداولك المُنشأة، وافتح أي جدول لعرض تفاصيله
          </p>
        </div>
      </header>

      {/* Error */}
      {errorMessage && (
        <div className="sl-alert-error">{errorMessage}</div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="sl-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="sl-skeleton" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && schedules.length === 0 && !errorMessage && (
        <EmptyState
          title="لا توجد جداول بعد"
          message="أنشئ جدولاً من صفحة قوائم الرغبات لتظهر هنا."
          actionLabel="الذهاب إلى قوائم الرغبات"
          onAction={() => navigate("/wishlists")}
        />
      )}

      {/* Grid */}
      {!loading && schedules.length > 0 && (
        <>
          <div className="sl-grid">
            {schedules.map((schedule) => (
              <ScheduleCard
                key={schedule.scheduleID}
                schedule={schedule}
                scheduleNumber={1}
                onOpen={() => handleOpenSchedule(schedule)}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="sl-load-more-wrapper">
              <button
                type="button"
                className="sl-load-more"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "جاري التحميل..." : "عرض المزيد"}
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
}