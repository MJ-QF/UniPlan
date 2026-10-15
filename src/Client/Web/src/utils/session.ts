const STUDENT_ID_KEY = "uniplan.studentId";
const ADMIN_ID_KEY = "uniplan.adminId";
const ROLE_KEY = "uniplan.role";

/* =========================
   Student ID
========================= */

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

/* =========================
   Admin ID
========================= */

export function saveAdminId(adminId: number): void {
  localStorage.setItem(ADMIN_ID_KEY, String(adminId));
}

export function getAdminId(): number | null {
  const raw = localStorage.getItem(ADMIN_ID_KEY);
  const id = raw ? Number(raw) : NaN;
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function clearAdminId(): void {
  localStorage.removeItem(ADMIN_ID_KEY);
}

/* =========================
   Role
========================= */

export type UserRole = "Admin" | "Student";

export function saveRole(role: UserRole): void {
  localStorage.setItem(ROLE_KEY, role);
}

export function getRole(): UserRole | null {
  const raw = localStorage.getItem(ROLE_KEY);
  if (raw === "Admin" || raw === "Student") return raw;
  return null;
}

export function isAdmin(): boolean {
  return getRole() === "Admin";
}

export function isStudent(): boolean {
  return getRole() === "Student";
}

/* =========================
   Clear All
========================= */

export function clearSession(): void {
  clearStudentId();
  clearAdminId();
  localStorage.removeItem(ROLE_KEY);
}