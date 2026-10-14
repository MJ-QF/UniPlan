import type {
    AccountResponse,
    CreateAccountRequest,
    UpdateAccountRequest,
} from "./auth";

export interface PersonResponse {
    personID: number;
    firstName: string;
    middleName: string;
    lastName: string;
    fullName: string;
}

export interface MajorResponse {
    majorID: number;
    majorName: string;
}

export interface StudentResponse {
    studentID: number;
    personInfo: PersonResponse;
    accountInfo: AccountResponse;
    majorInfo: MajorResponse;
    completedHours: number;
}


export interface CreateStudentRequest {
    accountData: CreateAccountRequest;
    personData: PersonRequest;
    majorID: number;
}


export interface AccountResponse {
  accountID: number;
  accountName: string | null;
  email: string | null;
  role: string | null;
}




export interface UpdateStudentRequest {
  accountData: { accountName: string | null; email: string | null };
  personData: {
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
  };
  majorID: number;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}