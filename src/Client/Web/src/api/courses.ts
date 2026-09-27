import client from './client';

export interface Course {
  courseID: number;
  courseName: string;
  creditHours: number;
  courseCode: string;
  neededHours: number;
}

export const getCourses = async (pageNumber = 1, pageSize = 20): Promise<Course[]> => {
  const response = await client.get<Course[]>('/courses', {
    params: { pageNumber, pageSize },
  });
  return response.data;
};