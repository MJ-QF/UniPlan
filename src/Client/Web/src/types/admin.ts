export interface PersonInfo {
  personID: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  fullName: string;
}

export interface AccountInfo {
  accountID: number;
  accountName: string;
  email: string;
  role: string;
}

export interface AdminResponse {
  adminID: number;
  person: PersonInfo;
  account: AccountInfo;
  isActive: boolean;
}