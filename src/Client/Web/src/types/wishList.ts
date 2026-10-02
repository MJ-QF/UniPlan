import type { CourseResponse } from "./course";

/* =========================
   Response DTOs
========================= */

export interface AcademicTermResponse {
  termID: number;
  termType: string | null;
  termYear: number;
}

export interface StudentTermResponse {
  registrationID: number;
  studentID: number;
  academicTerm: AcademicTermResponse | null;
}

export interface WishListResponse {
  wishListID: number;
  registrationInfo: StudentTermResponse | null;
  allowUpdate: boolean;
}

export interface WishListItemResponse {
  itemID: number;
  wishListID: number;
  course: CourseResponse | null;
}

/* =========================
   Request DTOs
========================= */

export interface WishListRequest {
  studentID: number;
  academicTermID: number;
  coursesIDs?: number[] | null;
}

export interface SyncCoursesRequest {
  courseIds?: number[] | null;
}