import type { CreateStudentRequest } from "../types/student";

const API_BASE_URL = "http://localhost:5260/api";

export async function createStudent(
  data: CreateStudentRequest
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/students`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`CREATE_STUDENT_ERROR_${response.status}`);
  }
}