import client from "./client";
import type { LoginRequest } from "../types/auth";

export interface AccountResponse {
  accountID: number;
  accountName: string;
  email: string;
  role: string;
}

export async function login(
  data: LoginRequest
): Promise<AccountResponse> {
  try {
    const response = await client.post<AccountResponse>(
      "/auth/login",
      data
    );

    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;

    if (status === 401) {
      throw new Error("LOGIN_ERROR_401");
    }

    if (status === 409) {
      throw new Error("LOGIN_ERROR_409");
    }

    if (status === 422) {
      throw new Error("LOGIN_ERROR_422");
    }

    if (status === 500) {
      throw new Error("LOGIN_ERROR_500");
    }

    throw new Error("LOGIN_ERROR_NETWORK");
  }
}