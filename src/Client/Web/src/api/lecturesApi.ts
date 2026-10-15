import client from "./client";
import type { LectureResponse } from "../types/lecture";

/* =========================
   Get All Lectures (with pagination)
   GET /api/lectures
========================= */
export async function getAllLectures(
  pageNumber: number = 1,
  pageSize: number = 100
): Promise<LectureResponse[]> {
  const { data } = await client.get<LectureResponse[]>("/lectures", {
    params: { pageNumber, pageSize },
  });
  return data;
}

/* =========================
   Get Lectures by Course
   يجيب كل الصفحات ويفلتر client-side
========================= */
export async function getLecturesByCourse(
  courseId: number
): Promise<LectureResponse[]> {
  const all: LectureResponse[] = [];
  let page = 1;
  const pageSize = 100;

  try {
    while (true) {
      const data = await getAllLectures(page, pageSize);
      const filtered = data.filter(
        (l) => l.courseInfo.courseID === courseId
      );
      all.push(...filtered);

      if (data.length < pageSize) break;
      page++;

      /* حماية من loop لا نهائي */
      if (page > 20) break;
    }
  } catch (error) {
    console.error("Failed to fetch lectures:", error);
  }

  return all;
}