import type { PersonalInfoValues } from '../components/forms/PersonalInfoFields';
import type { StudentResponse, UpdateStudentRequest } from '../types/student';

export const fromStudentResponse = (s: StudentResponse): PersonalInfoValues => ({
  firstName: s.personInfo.firstName ?? '',
  middleName: s.personInfo.middleName ?? '',
  lastName: s.personInfo.lastName ?? '',
  accountName: s.accountInfo.accountName ?? '',
  email: s.accountInfo.email ?? '',
  majorID: String(s.majorInfo.majorID),
});

export const toUpdateStudentPayload = (v: PersonalInfoValues): UpdateStudentRequest => ({
  accountData: { accountName: v.accountName, email: v.email },
  personData: { firstName: v.firstName, middleName: v.middleName, lastName: v.lastName },
  majorID: Number(v.majorID),
});

// نفس القيم لصفحة SignUp، بس بإضافة الباسورد
export const toCreateStudentPayload = (v: PersonalInfoValues, password: string) => ({
  accountData: { accountName: v.accountName, email: v.email, password },
  personData: { firstName: v.firstName, middleName: v.middleName, lastName: v.lastName },
  majorID: Number(v.majorID),
});