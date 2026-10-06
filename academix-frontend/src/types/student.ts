export interface EnrollmentItem {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  courseId: number;
  courseTitle: string;
  enrolledAt: string;
  status: string;
}

export interface GradeItem {
  id: number;
  submissionId: number;
  assignmentId: number;
  assignmentTitle: string;
  studentId: number;
  studentName: string;
  courseId: number;
  totalMarks: number;
  marksAwarded: number;
  feedback: string | null;
  gradedAt: string;
}

export interface NotificationItem {
  id: number;
  message: string;
  type: string;
  read?: boolean;
  isRead?: boolean;
  createdAt: string;
}