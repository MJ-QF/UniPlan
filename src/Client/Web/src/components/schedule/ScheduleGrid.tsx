import { WEEK_DAYS, getLectureTypeLabel } from "../../utils/scheduleConstants";
import type { SessionBriefResponse } from "../../types/schedule";
import "./ScheduleGrid.css";

interface Props {
  sessions?: SessionBriefResponse[];
}

/* =========================
   Time Config
========================= */
const START_HOUR = 8;
const END_HOUR = 20;
const SLOT_MINUTES = 30;
const TOTAL_SLOTS = ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function timeToSlot(time: string): number {
  const minutes = timeToMinutes(time);
  const offset = minutes - START_HOUR * 60;
  return Math.max(0, Math.floor(offset / SLOT_MINUTES));
}

function slotLabel(index: number): string {
  const totalMinutes = START_HOUR * 60 + index * SLOT_MINUTES;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const period = h >= 12 ? "م" : "ص";
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

function formatTime(time: string): string {
  if (!time) return "—";
  const [hourStr, minute] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? "م" : "ص";
  const hour12 = hour % 12 || 12;
  return `${String(hour12).padStart(2, "0")}:${minute} ${period}`;
}

/* ✅ يدعم العربي والإنجليزي */
function dayStringToIndex(day: string | null): number {
  if (!day) return -1;

  const map: Record<string, number> = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
    Thursday: 4, Friday: 5, Saturday: 6,

    "الأحد": 0, "الإثنين": 1, "الاثنين": 1,
    "الثلاثاء": 2, "الأربعاء": 3, "الاربعاء": 3,
    "الخميس": 4, "الجمعة": 5, "السبت": 6,
  };

  return map[day.trim()] ?? -1;
}

/* =========================
   Component
========================= */
export default function ScheduleGrid({ sessions = [] }: Props) {
  /* ✅ حماية: إذا sessions undefined → مصفوفة فاضية */
  const safeSessions = Array.isArray(sessions) ? sessions : [];

  const validSessions = safeSessions.filter((s) => {
    const idx = dayStringToIndex(s.day);
    return idx >= 0 && idx <= 6;
  });

  const slots = Array.from({ length: TOTAL_SLOTS }, (_, i) => i);

  return (
    <div className="sg-wrapper">
      <div className="sg-grid">

        {/* Header */}
        <div className="sg-corner" />
        {WEEK_DAYS.map((day) => (
          <div key={day.value} className="sg-day-header">
            {day.label}
          </div>
        ))}

        {/* Time labels */}
        {slots.map((slot) => (
          <div
            key={`time-${slot}`}
            className={`sg-time-label ${slot % 2 === 0 ? "is-major" : ""}`}
            style={{ gridColumn: 1, gridRow: slot + 2 }}
          >
            {slot % 2 === 0 && slotLabel(slot)}
          </div>
        ))}

        {/* Empty cells */}
        {slots.map((slot) =>
          WEEK_DAYS.map((day, dayIdx) => (
            <div
              key={`cell-${slot}-${day.value}`}
              className={`sg-cell ${slot % 2 === 0 ? "is-major" : ""}`}
              style={{ gridColumn: dayIdx + 2, gridRow: slot + 2 }}
            />
          ))
        )}

        {/* Sessions */}
        {validSessions.map((session) => {
          const dayIdx = dayStringToIndex(session.day);
          const startSlot = timeToSlot(session.startTime);
          const endSlot = timeToSlot(session.endTime);
          const span = Math.max(1, endSlot - startSlot);

          const color = getCourseColor(
            session.courseOffering.lectureInfo.courseInfo.courseCode
          );

          return (
            <div
              key={session.sessionID}
              className="sg-session"
              style={{
                gridColumn: dayIdx + 2,
                gridRow: `${startSlot + 2} / span ${span}`,
                ["--session-color" as string]: color,
              }}
            >
              <div className="sg-session-name">
                {session.courseOffering.lectureInfo.courseInfo.courseName}
              </div>
              <div className="sg-session-code">
                {session.courseOffering.lectureInfo.courseInfo.courseCode}
              </div>
              <div className="sg-session-time">
                {formatTime(session.startTime)} - {formatTime(session.endTime)}
              </div>
              <div className="sg-session-meta">
                <span>شعبة {session.courseOffering.sectionNumber}</span>
                <span>•</span>
                <span>{getLectureTypeLabel(session.courseOffering.lectureInfo.lectureType)}</span>
              </div>
            </div>
          );
        })}

      </div>

      {/* Legend */}
      {validSessions.length > 0 && (
        <div className="sg-legend">
          {Array.from(
            new Map(
              validSessions.map((s) => [
                s.courseOffering.lectureInfo.courseInfo.courseCode ?? "—",
                s.courseOffering.lectureInfo.courseInfo.courseName ?? "—",
              ])
            ).entries()
          ).map(([code, name]) => (
            <div key={code} className="sg-legend-item">
              <span
                className="sg-legend-dot"
                style={{ background: getCourseColor(code) }}
              />
              <span className="sg-legend-text">{name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================
   Color Generation
========================= */
const COURSE_COLORS = [
  "#1591a3", "#f2b84b", "#7c5cbf", "#d97706",
  "#10b981", "#e11d48", "#0284c7", "#8b5cf6",
];

function getCourseColor(code: string | null): string {
  if (!code) return COURSE_COLORS[0];

  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = (hash << 5) - hash + code.charCodeAt(i);
    hash |= 0;
  }

  return COURSE_COLORS[Math.abs(hash) % COURSE_COLORS.length];
}