import type {
  EnrollmentItem,
  GradeItem,
  NotificationItem,
} from "../types/student";

const BASE_URL = "http://localhost:8080/api";

async function request<T>(path: string, method = "GET"): Promise<T> {
  const token = localStorage.getItem("token");

  const response = await fetch(BASE_URL + path, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export function getUserId(): number {
  return Number(localStorage.getItem("userId"));
}

export function getMyEnrollments() {
  return request<EnrollmentItem[]>(`/enrollments/student/${getUserId()}`);
}

export function getMyGrades() {
  return request<GradeItem[]>(`/grades/student/${getUserId()}`);
}

export function getMyNotifications() {
  return request<NotificationItem[]>("/notifications");
}

export function markNotificationRead(id: number) {
  return request<NotificationItem>(`/notifications/${id}/read`, "PUT");
}

export function isRead(n: NotificationItem): boolean {
  return Boolean(n.read ?? n.isRead);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}