import type { WishListResponse } from "./wishList";

/* =========================
   Response DTOs
========================= */

/* عنصر في قائمة جداول الطالب */
export interface GeneratedScheduleResponse {
  scheduleID: number;
  wishListInfo: WishListResponse;
}

/* تفاصيل جدول كامل */
export interface ScheduleDetailResponse {
  scheduleID: number;
  sessions: SessionBriefResponse[];
}

export interface SessionBriefResponse {
  sessionID: number;
  courseOffering: CourseOfferingBriefResponse;
  startTime: string;   /* "HH:mm:ss" */
  endTime: string;     /* "HH:mm:ss" */
  day: string | null;  /* "Sunday", "Monday", ... */
}

export interface CourseOfferingBriefResponse {
  offeringID: number;
  sectionNumber: number;
  lectureInfo: LectureBriefResponse;
}

export interface LectureBriefResponse {
  lectureID: number;
  lectureType: string | null;
  courseInfo: CourseBriefResponse;
}

export interface CourseBriefResponse {
  courseID: number;
  courseName: string | null;
  courseCode: string | null;
}

/* =========================
   Request DTOs
========================= */

export interface GeneratedScheduleRequest {
  wishListID: number;
  days: number[] | null;
  startTime: string;  /* "HH:mm:ss" */
  endTime: string;    /* "HH:mm:ss" */
}