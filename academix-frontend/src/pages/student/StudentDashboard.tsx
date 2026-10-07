import { useEffect, useState } from "react";

type Enrollment = {
  id: number;
  courseId: number;
  courseTitle: string;
  status: string;
};

type Assignment = {
  id: number;
  courseId: number;
  title: string;
  description: string;
  dueDate: string;
  totalMarks: number;
  courseTitle: string;
};

type Grade = {
  id: number;
  assignmentTitle: string;
  totalMarks: number;
  marksAwarded: number;
  gradedAt: string;
};

type Notification = {
  id: number;
  message: string;
  type: string;
  read?: boolean;
  isRead?: boolean;
  createdAt: string;
};

function StudentDashboard() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [deadlines, setDeadlines] = useState<Assignment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string>("");

  const token = localStorage.getItem("token");
  const studentId = Number(localStorage.getItem("userId"));

  // A notification is unread when "read" is false
  function isUnread(notification: Notification) {
    return !(notification.read ?? notification.isRead);
  }

  const unreadNotifications = notifications.filter(isUnread);

  useEffect(() => {
    loadDashboard();
  }, []);

  // Load everything the dashboard needs
  async function loadDashboard() {
    if (!token) {
      setError("You must be logged in to view your dashboard.");
      return;
    }

    try {
      const enrolled = await loadEnrollments();
      await loadDeadlines(enrolled);
      await loadGrades();
      await loadNotifications();
    } catch (error) {
      setError("ERROR: " + String(error));
    }
  }

  // Load enrollments
  async function loadEnrollments() {
    const response = await fetch(`/api/enrollments/student/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      setError("Could not load your courses.");
      return [];
    }

    const data: Enrollment[] = await response.json();
    setEnrollments(data);
    return data;
  }

  // Load assignments of every active course and keep the ones not yet due
  async function loadDeadlines(enrolled: Enrollment[]) {
    const upcoming: Assignment[] = [];

    for (const enrollment of enrolled) {
      if (enrollment.status !== "ACTIVE") {
        continue;
      }

      const response = await fetch(
        `/api/assignments/course/${enrollment.courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const data: Assignment[] = await response.json();

        for (const assignment of data) {
          if (new Date(assignment.dueDate) > new Date()) {
            upcoming.push({
              ...assignment,
              courseTitle: enrollment.courseTitle,
            });
          }
        }
      }
    }

    // Soonest deadline first
    upcoming.sort(
      (a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    setDeadlines(upcoming);
  }

  // Load grades
  async function loadGrades() {
    const response = await fetch(`/api/grades/student/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const data: Grade[] = await response.json();
      setGrades(data);
    }
  }

  // Load notifications
  async function loadNotifications() {
    const response = await fetch("/api/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const data: Notification[] = await response.json();
      setNotifications(data);
    }
  }

  return (
    <>
      {/* HEADER */}

      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">STUDENT PORTAL</p>

          <h1>Student Dashboard</h1>

          <p className="dashboard-description">
            See your deadlines, grades and notifications in one place.
          </p>
        </div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {/* OVERVIEW */}

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <p className="dashboard-card-label">MY COURSES</p>
          <div className="dashboard-card-value">{enrollments.length}</div>
          <p>Courses you are enrolled in</p>
        </div>

        <div className="dashboard-card">
          <p className="dashboard-card-label">DEADLINES</p>
          <div className="dashboard-card-value">{deadlines.length}</div>
          <p>Assignments still open</p>
        </div>

        <div className="dashboard-card">
          <p className="dashboard-card-label">GRADES</p>
          <div className="dashboard-card-value">{grades.length}</div>
          <p>Marks released so far</p>
        </div>

        <div className="dashboard-card">
          <p className="dashboard-card-label">NOTIFICATIONS</p>
          <div className="dashboard-card-value">
            {unreadNotifications.length}
          </div>
          <p>Unread updates</p>
        </div>
      </div>

      {/* UPCOMING DEADLINES */}

      <section className="courses-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">ASSIGNMENTS</p>
            <h2>Upcoming Deadlines</h2>
            <p>Assignments you still need to hand in.</p>
          </div>
        </div>

        {deadlines.length === 0 ? (
          <div className="dashboard-empty">
            <p>No upcoming deadlines.</p>
          </div>
        ) : (
          <div className="compact-list">
            {deadlines.slice(0, 5).map((assignment, index) => (
              <div className="compact-list-item" key={assignment.id}>
                <span className="list-number">{index + 1}</span>

                <div>
                  <strong>{assignment.title}</strong>

                  <p>
                    {assignment.courseTitle} · {assignment.totalMarks} marks
                  </p>

                  <small>
                    Due {new Date(assignment.dueDate).toLocaleString()}
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* RECENT GRADES */}

      <section className="courses-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">RESULTS</p>
            <h2>Recent Grades</h2>
            <p>Your latest released marks.</p>
          </div>
        </div>

        {grades.length === 0 ? (
          <div className="dashboard-empty">
            <p>No grades released yet.</p>
          </div>
        ) : (
          <div className="compact-list">
            {grades.slice(0, 3).map((grade, index) => (
              <div className="compact-list-item" key={grade.id}>
                <span className="list-number">{index + 1}</span>

                <div>
                  <strong>{grade.assignmentTitle}</strong>

                  <p>
                    {grade.marksAwarded} / {grade.totalMarks}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* NEW NOTIFICATIONS */}

      <section className="courses-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">UPDATES</p>
            <h2>New Notifications</h2>
            <p>Things you have not read yet.</p>
          </div>
        </div>

        {unreadNotifications.length === 0 ? (
          <div className="dashboard-empty">
            <p>You are all caught up.</p>
          </div>
        ) : (
          <div className="compact-list">
            {unreadNotifications.slice(0, 3).map((notification, index) => (
              <div className="compact-list-item" key={notification.id}>
                <span className="list-number">{index + 1}</span>

                <div>
                  <strong>{notification.message}</strong>

                  <small>
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default StudentDashboard;