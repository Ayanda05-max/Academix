import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  formatDate,
  getMyEnrollments,
  getMyGrades,
  getMyNotifications,
  isRead,
} from "../../services/studentService";
import type { EnrollmentItem, GradeItem, NotificationItem } from "../../types/student";

function StudentDashboard() {
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyEnrollments(), getMyGrades(), getMyNotifications()])
      .then(([e, g, n]) => {
        setEnrollments(e);
        setGrades(g);
        setNotifications(n);
      })
      .catch(() => setError("Could not load your dashboard. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const recentGrades = [...grades]
    .sort((a, b) => new Date(b.gradedAt).getTime() - new Date(a.gradedAt).getTime())
    .slice(0, 3);
  const unread = notifications.filter((n) => !isRead(n));

  if (loading) return <p className="st-sub">Loading...</p>;

  return (
    <>
      <h1 className="st-title">Dashboard</h1>
      <p className="st-sub">Your courses, grades and notifications in one place.</p>

      {error && <div className="st-error">{error}</div>}

      <div className="st-stats">
        <div className="st-card">
          <div className="st-stat-num">{enrollments.length}</div>
          <div className="st-stat-label">Enrolled courses</div>
        </div>
        <div className="st-card">
          <div className="st-stat-num">{grades.length}</div>
          <div className="st-stat-label">Graded assessments</div>
        </div>
        <div className="st-card">
          <div className="st-stat-num">{unread.length}</div>
          <div className="st-stat-label">Unread notifications</div>
        </div>
      </div>

      <div className="st-grid">
        <div className="st-card">
          <h2 className="st-section-title">Recent grades</h2>
          {recentGrades.length === 0 && <p className="st-meta">No grades released yet.</p>}
          {recentGrades.map((g) => (
            <div className="st-row" key={g.id}>
              <div>
                <div>{g.assignmentTitle}</div>
                <div className="st-meta">{formatDate(g.gradedAt)}</div>
              </div>
              <strong>{g.marksAwarded}/{g.totalMarks}</strong>
            </div>
          ))}
          <p><Link to="/student/grades">View all grades</Link></p>
        </div>

        <div className="st-card">
          <h2 className="st-section-title">New notifications</h2>
          {unread.length === 0 && <p className="st-meta">You're all caught up.</p>}
          {unread.slice(0, 3).map((n) => (
            <div className="st-row st-unread" key={n.id}>
              <div>
                <div>{n.message}</div>
                <div className="st-meta">{formatDate(n.createdAt)}</div>
              </div>
            </div>
          ))}
          <p><Link to="/student/notifications">View all notifications</Link></p>
        </div>
      </div>
    </>
  );
}

export default StudentDashboard;