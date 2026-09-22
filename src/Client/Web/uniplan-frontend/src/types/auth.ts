export interface LoginRequest {
    accountName: string;
    password: string;
}

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}

export interface CreateAccountRequest {
    accountName: string;
    password: string;
    email: string;
}

export interface UpdateAccountRequest {
    accountName: string;
    email: string;
}

export interface AccountResponse {
    accountID: number;
    accountName: string;
    email: string;
    role: string;
}