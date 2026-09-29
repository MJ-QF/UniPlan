import axios from "axios";
import client from "./client";
import type {
  CreateStudentRequest,
  StudentResponse,
} from "../types/student";

/*
  إنشاء حساب طالب جديد.
  POST /api/students  →  201 + StudentResponse
  عند الخطأ axios بيرمي exception فيها error.response.data (نص الخطأ من الباك).
*/
export async function createStudent(
  data: CreateStudentRequest
): Promise<StudentResponse> {
  const { data: student } = await client.post<StudentResponse>(
    "/students",
    data
  );
  return student;
}

/*
  جلب الطالب المرتبط بحساب معين.
  GET /api/students/by-account/{accountId}
  بيرجع null إذا ما في طالب مرتبط بالحساب (404)، مثلاً حساب إداري.
*/
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