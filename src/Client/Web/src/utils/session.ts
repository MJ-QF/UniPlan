const STUDENT_ID_KEY = "uniplan.studentId";

export function saveStudentId(studentId: number): void {
  localStorage.setItem(STUDENT_ID_KEY, String(studentId));
}

export const getStudentId = (): number | null => {
  const v = localStorage.getItem("uniplan.studentId");
  return v ? Number(v) : null;
};
export function clearStudentId(): void {
  localStorage.removeItem(STUDENT_ID_KEY);
}
