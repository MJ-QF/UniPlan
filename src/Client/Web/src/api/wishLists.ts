import client from "./client";
import type {
  WishListResponse,
  WishListItemResponse,
  WishListRequest,
  SyncCoursesRequest,
} from "../types/wishList";

/* =========================
   List Wish Lists for a Student
   GET /api/students/{studentID}/wishLists
========================= */
export async function getStudentWishLists(
  studentId: number,
  pageNumber: number = 1,
  pageSize: number = 50
): Promise<WishListResponse[]> {
  const { data } = await client.get<WishListResponse[]>(
    `/students/${studentId}/wishLists`,
    {
      params: { pageNumber, pageSize },
    }
  );
  return data;
}

/* =========================
   Get Wish List Details
   GET /api/wishLists/{id}
========================= */
export async function getWishListById(
  wishListId: number
): Promise<WishListResponse> {
  const { data } = await client.get<WishListResponse>(
    `/wishLists/${wishListId}`
  );
  return data;
}

/* =========================
   Get Wish List Items
   GET /api/wishLists/{id}/items
========================= */
export async function getWishListItems(
  wishListId: number
): Promise<WishListItemResponse[]> {
  const { data } = await client.get<WishListItemResponse[]>(
    `/wishLists/${wishListId}/items`
  );
  return data;
}

/* =========================
   Create Wish List
   POST /api/wishLists
========================= */
export async function createWishList(
  payload: WishListRequest
): Promise<WishListResponse> {
  const { data } = await client.post<WishListResponse>(
    "/wishLists",
    payload
  );
  return data;
}

/* =========================
   Sync Courses (Update)
   PUT /api/wishLists/{id}/syncCourses
========================= */
export async function syncWishListCourses(
  wishListId: number,
  payload: SyncCoursesRequest
): Promise<boolean> {
  const { data } = await client.put<boolean>(
    `/wishLists/${wishListId}/syncCourses`,
    payload
  );
  return data;
}

/* =========================
   Delete Wish List
   DELETE /api/wishLists/{id}
========================= */
export async function deleteWishList(
  wishListId: number
): Promise<void> {
  await client.delete(`/wishLists/${wishListId}`);
}