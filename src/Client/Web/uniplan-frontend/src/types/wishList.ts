import type { StudentTermResponse } from "./term";
import type { CourseResponse } from "./course";

export interface WishListResponse {
    wishListID: number;
    registrationInfo: StudentTermResponse;
}

export interface WishListItemResponse {
    itemID: number;
    wishListID: number;
    course: CourseResponse;
}