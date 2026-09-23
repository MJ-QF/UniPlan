export interface AcademicTermResponse {
    termID: number;
    termType: string;
    termYear: number;
}

export interface StudentTermResponse {
    registrationID: number;
    studentID: number;
    academicTerm: AcademicTermResponse;
}