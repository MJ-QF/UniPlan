const STUDENT_ID_KEY = "uniplan.studentId";

export function saveStudentId(studentId: number): void {
  localStorage.setItem(STUDENT_ID_KEY, String(studentId));
}

export function getStudentId(): number | null {
  const raw = localStorage.getItem(STUDENT_ID_KEY);
  const id = raw ? Number(raw) : NaN;
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function clearStudentId(): void {
  localStorage.removeItem(STUDENT_ID_KEY);
}