import type { MajorResponse } from "../types/student";

const API_BASE_URL = "http://localhost:5260/api";

export async function getMajors(): Promise<MajorResponse[]> {
  const response = await fetch(
    `${API_BASE_URL}/majors?pageNumber=1&pageSize=100`
  );

  if (!response.ok) {
    throw new Error(`MAJORS_ERROR_${response.status}`);
  }

  return response.json();
}
