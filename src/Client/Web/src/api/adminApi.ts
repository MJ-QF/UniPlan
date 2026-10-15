import axios from "axios";
import client from "./client";
import type { AdminResponse } from "../types/admin";

export async function getAllAdmins(
  pageNumber: number = 1,
  pageSize: number = 10
): Promise<AdminResponse[]> {
  const { data } = await client.get<AdminResponse[]>("/admins", {
    params: { pageNumber, pageSize },
  });
  return data;
}

export async function getAdminById(
  adminID: number
): Promise<AdminResponse> {
  const { data } = await client.get<AdminResponse>(`/admins/${adminID}`);
  return data;
}

/* ✅ الجديد */
export async function getAdminByAccountId(
  accountId: number
): Promise<AdminResponse | null> {
  try {
    const { data } = await client.get<AdminResponse>(
      `/admins/by-account/${accountId}`
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}