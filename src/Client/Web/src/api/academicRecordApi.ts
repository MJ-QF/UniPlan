export interface Course {
  courseId: number;
  courseCode: string;
  courseName: string;
  creditHours: number;
}

/*
  جلب المواد المتاحة للطالب للاختيار.
  
  حاليًا الـURL تجريبي.
  لاحقًا نستبدله بالـEndpoint الحقيقي الموجود في Backend.
*/
export async function getStudentCourses(): Promise<Course[]> {
  const response = await fetch(
    "http://localhost:5260/api/courses"
  );

  if (!response.ok) {
    throw new Error("فشل في جلب المواد");
  }

  const data: Course[] = await response.json();

  return data;
}


/*
  حفظ المواد التي اختارها الطالب.
  
  studentId والـcourses سيتم تعديلهم لاحقًا
  حسب شكل الـAPI الحقيقي.
*/
export async function saveStudentCourses(
  studentId: number,
  courseIds: number[]
): Promise<void> {
  const response = await fetch(
    `http://localhost:5260/api/students/${studentId}/courses`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        courseIds,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("فشل في حفظ المواد");
  }
}