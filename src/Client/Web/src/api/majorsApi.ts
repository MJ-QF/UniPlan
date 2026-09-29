import client from "./client";
import type { MajorResponse } from "../types/student";

export async function getMajors(): Promise<MajorResponse[]> {
  const response = await client.get<MajorResponse[]>("/majors", {
    params: {
      pageNumber: 1,
      pageSize: 100,
    },
  });

  return response.data;
}