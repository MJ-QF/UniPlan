import client from "./client";
import type { MajorResponse } from "../types/student";

export async function getMajors(pageSize = 100): Promise<MajorResponse[]> {
  const { data } = await client.get<MajorResponse[]>("/majors", {
    params: { pageNumber: 1, pageSize },
  });
  return data;
}