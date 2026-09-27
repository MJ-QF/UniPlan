import type { WishListResponse } from "./wishList";
import type { CourseBriefResponse } from "./course";

export interface GeneratedScheduleResponse {
    scheduleID: number;
    wishListInfo: WishListResponse;
}

export interface ScheduleDetailResponse {
    scheduleID: number;
    sessions: SessionBriefResponse[];
}

export interface SessionBriefResponse {
    sessionID: number;
    courseOffering: CourseOfferingBriefResponse;
    day: string;
    startTime: string;
    endTime: string;
}

export interface CourseOfferingBriefResponse {
    offeringID: number;
    sectionNumber: number;
    lectureInfo: LectureBriefResponse;
}

export interface LectureBriefResponse {
    lectureID: number;
    lectureType: string;
    courseInfo: CourseBriefResponse;
}