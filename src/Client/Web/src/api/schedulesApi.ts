import client from "./client";
import type {
  GeneratedScheduleResponse,
  ScheduleDetailResponse,
  GeneratedScheduleRequest,
} from "../types/schedule";

/* =========================
   Get Student Schedules
   GET /api/students/{studentID}/schedules
========================= */
export async function getStudentSchedules(
  studentId: number,
  pageNumber: number = 1,
  pageSize: number = 10
): Promise<GeneratedScheduleResponse[]> {
  const { data } = await client.get<GeneratedScheduleResponse[]>(
    `/students/${studentId}/schedules`,
    {
      params: { pageNumber, pageSize },
    }
  );
  return data;
}

/* =========================
   Get Schedule Detail
   GET /api/wishLists/{listID}/{scheduleNum}/scheduleDetail
========================= */
export async function getScheduleDetail(
  listId: number,
  scheduleNum: number
): Promise<ScheduleDetailResponse> {
  const { data } = await client.get<ScheduleDetailResponse>(
    `/wishLists/${listId}/${scheduleNum}/scheduleDetail`
  );
  return data;
}

/* =========================
   Create Schedule
   POST /api/generatedSchedules
========================= */
export async function createSchedule(
  payload: GeneratedScheduleRequest
): Promise<GeneratedScheduleResponse> {
  const { data } = await client.post<GeneratedScheduleResponse>(
    "/generatedSchedules",
    payload
  );
  return data;
}