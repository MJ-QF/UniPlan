import axios from "axios";
import client from "./client";
import type {
  CreateStudentRequest,
  StudentResponse,
} from "../types/student";
import type {
  CourseResponse,
  StudentCourseResponse,
} from "../types/course";

/* =========================
   Types
========================= */

export interface PlanStatusItem {
  course: CourseResponse;
  status: string | null;
  coursePrerequisitesCodes: string[];
}

/* =========================
   Create Student
   POST /api/students
========================= */
export async function createStudent(
  data: CreateStudentRequest
): Promise<StudentResponse> {
  const { data: student } = await client.post<StudentResponse>(
    "/students",
    data
  );
  return student;
}

/* =========================
   Get Student by Account ID
   GET /api/students/by-account/{accountId}
========================= */
export async function getStudentByAccountId(
  accountId: number
): Promise<StudentResponse | null> {
  try {
    const { data } = await client.get<StudentResponse>(
      `/students/by-account/${accountId}`
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/* =========================
   Get Plan Status
   GET /api/students/{id}/plan-status
========================= */
export async function getPlanStatus(
  studentId: number
): Promise<PlanStatusItem[]> {
  const { data } = await client.get<PlanStatusItem[]>(
    `/students/${studentId}/plan-status`
  );
  return data;
}

/* =========================
   Get Student Courses (Passed & Registered)
   GET /api/students/{id}/courses
========================= */
export async function getStudentCourses(
  studentId: number
): Promise<StudentCourseResponse[]> {
  const { data } = await client.get<StudentCourseResponse[]>(
    `/students/${studentId}/courses`
  );
  return data;
}