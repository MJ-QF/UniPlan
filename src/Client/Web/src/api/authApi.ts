import type {
  LoginRequest,
  CreateAccountRequest,
  UpdateAccountRequest,
  ChangePasswordRequest,
  AccountResponse,
} from "../types/auth";

const API_BASE_URL = "http://localhost:5260/api";

export async function login(
  data: LoginRequest
): Promise<AccountResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`LOGIN_ERROR_${response.status}`);
  }

  return response.json();
}