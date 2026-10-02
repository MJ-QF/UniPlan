import axios from "axios";
import client from "./client";
import type {
  CreateStudentRequest,
  StudentResponse,
} from "../types/student";
import type { CourseResponse } from "../types/course";

/* =========================
   Types خاصة بـ plan-status
========================= */

export interface PlanStatusItem {
  course: CourseResponse;
  status: string | null;
  coursePrerequisitesIDs: number[];
}

/* =========================
   إنشاء حساب طالب جديد
   POST /api/students → 201 + StudentResponse
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
   جلب الطالب المرتبط بحساب معين
   GET /api/students/by-account/{accountId}
   يرجع null إذا ما في طالب مرتبط بالحساب (404)
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
   جلب حالة الخطة الدراسية للطالب
   GET /api/students/{studentID}/plan-status
========================= */
export async function getPlanStatus(
  studentId: number
): Promise<PlanStatusItem[]> {
  const { data } = await client.get<PlanStatusItem[]>(
    `/students/${studentId}/plan-status`
  );
  return data;
}