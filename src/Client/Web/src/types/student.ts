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

export interface PersonRequest {
    firstName: string;
    middleName: string;
    lastName: string;
}

export interface CreateStudentRequest {
    accountData: CreateAccountRequest;
    personData: PersonRequest;
    majorID: number;
}

export interface UpdateStudentRequest {
    accountData: UpdateAccountRequest;
    personData: PersonRequest;
    majorID: number;
}