import type { AcademicTermResponse } from "./wishList";
import type { LectureResponse } from "./lecture";

/* =========================
   Response
========================= */
export interface CourseOfferingResponse {
  offeringID: number;
  sectionNumber: number;
  createdByAdminID: number | null;
  termInfo: AcademicTermResponse;
  lectureInfo: LectureResponse;
}

/* =========================
   Requests
========================= */
export interface CreateCourseOfferingRequest {
  numberOfSections: number;
  termID: number;
  lectureType: number;      /* 1 | 2 | 3 */
  createdByAdminID: number;
  courseID: number;
}

export interface UpdateCourseOfferingRequest {
  sectionNumber: number;
  termID: number;
  lectureID: number;
  courseID: number;
}