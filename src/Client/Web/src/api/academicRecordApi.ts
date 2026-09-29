import client from "./client";
import type { CourseResponse } from "../types/course";

interface PlanStatusItem {
  course: CourseResponse;
  status: string | null;
  coursePrerequisitesIDs: number[];
}

/*
  جلب كل مواد تخصص الطالب (بما فيها متطلبات التخصص الأب)
  من: GET /api/students/{studentId}/plan-status
  نأخذ منه المواد فقط، ونتجاهل الـstatus لأن الطالب هلا بيحدد اللي درسه.
*/
export async function getMajorCourses(
  studentId: number
): Promise<CourseResponse[]> {
  const { data } = await client.get<PlanStatusItem[]>(
    `/students/${studentId}/plan-status`
  );

  // حماية من التكرار (الـSP بيعمل LEFT JOIN مع المتطلبات)
  const unique = new Map<number, CourseResponse>();
  for (const item of data) {
    unique.set(item.course.courseID, item.course);
  }

  return [...unique.values()];
}

/*
  حفظ المواد اللي درسها الطالب.
  POST /api/students/{studentId}/passed-courses  { courseIds: [...] }
  ملاحظة: الباك بيمسح كل مواد الطالب القديمة ويعيد إدخالها (Sync).
*/
export async function saveStudentCourses(
  studentId: number,
  courseIds: number[]
): Promise<void> {
  await client.post(`/students/${studentId}/passed-courses`, { courseIds });
}