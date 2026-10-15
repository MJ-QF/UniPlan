import client from "./client";
import type {
  CourseOfferingResponse,
  CreateCourseOfferingRequest,
  UpdateCourseOfferingRequest,
} from "../types/courseOffering";

/* =========================
   Filters
========================= */
export interface CourseOfferingFilters {
  termID?: number;
  courseName?: string;
  pageNumber?: number;
  pageSize?: number;
}

/* =========================
   Get All (with filters)
   GET /api/courseOfferings
========================= */
export async function getCourseOfferings(
  filters: CourseOfferingFilters = {}
): Promise<CourseOfferingResponse[]> {
  const { data } = await client.get<CourseOfferingResponse[]>(
    "/courseOfferings",
    {
      params: {
        termID: filters.termID,
        courseName: filters.courseName,
        pageNumber: filters.pageNumber ?? 1,
        pageSize: filters.pageSize ?? 10,
      },
    }
  );
  return data;
}

/* =========================
   Create (multiple sections)
   POST /api/courseOfferings
   Response: نص (string)
========================= */
export async function createCourseOffering(
  payload: CreateCourseOfferingRequest
): Promise<string> {
  const { data } = await client.post<string>(
    "/courseOfferings",
    payload
  );
  return data;
}

/* =========================
   Update
   PUT /api/courseOfferings/{offeringID}
   Response: 204 No Content
========================= */
export async function updateCourseOffering(
  offeringID: number,
  payload: UpdateCourseOfferingRequest
): Promise<void> {
  await client.put(`/courseOfferings/${offeringID}`, payload);
}

/* =========================
   Delete
   DELETE /api/courseOfferings/{offeringID}
   Response: 204 No Content
========================= */
export async function deleteCourseOffering(
  offeringID: number
): Promise<void> {
  await client.delete(`/courseOfferings/${offeringID}`);
}