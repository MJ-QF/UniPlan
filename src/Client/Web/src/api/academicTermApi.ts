import client from "./client";
import type { AcademicTermResponse } from "../types/wishList";

/* =========================
   Get All Academic Terms
   GET /api/academicTerms
========================= */
export async function getAcademicTerms(
  pageNumber: number = 1,
  pageSize: number = 50
): Promise<AcademicTermResponse[]> {
  const { data } = await client.get<AcademicTermResponse[]>(
    "/academicTerms",
    {
      params: { pageNumber, pageSize },
    }
  );
  return data;
}