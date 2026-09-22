export interface CourseResponse {
    courseID: number;
    courseName: string;
    courseCode: string;
    creditHours: number;
    neededHours: number;
}

export interface CourseBriefResponse {
    courseID: number;
    courseName: string;
    courseCode: string;
}

export interface StudentCourseResponse {
    enrolmentID: number;
    studentID: number;
    isPassed: boolean;
    course: CourseResponse;
}

export interface CoursePrerequisiteResponse {
    preRequestID: number;
    mainCourseInfo: CourseResponse;
    preRequestCourseInfo: CourseResponse;
}