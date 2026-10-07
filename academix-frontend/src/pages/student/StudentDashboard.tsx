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

type CourseProgress = {
  courseId: number;
  courseTitle: string;
  completedLessons: number;
  totalLessons: number;
  completionPercentage: number;
};

function StudentDashboard() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [deadlines, setDeadlines] = useState<Assignment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
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
      await loadProgress(enrolled);
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

  async function loadProgress(enrolled: Enrollment[]) {
    const results: CourseProgress[] = [];

    for (const enrollment of enrolled) {
      if (enrollment.status !== "ACTIVE") {
        continue;
      }

      try {
        const response = await fetch(
          `/api/progress/${studentId}/${enrollment.courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.ok) {
          const data = await response.json();

          results.push({
            courseId: enrollment.courseId,
            courseTitle: enrollment.courseTitle,
            completedLessons: data.completedLessons ?? 0,
            totalLessons: data.totalLessons ?? 0,
            completionPercentage: data.completionPercentage ?? 0,
          });
        }
      } catch (error) {
        console.error("Could not load progress:", error);
      }
    }

    setProgress(results);
  }

  const totalLessonsAll = progress.reduce((sum, p) => sum + p.totalLessons, 0);
  const completedLessonsAll = progress.reduce(
    (sum, p) => sum + p.completedLessons,
    0
  );
  const overallPercentage =
    totalLessonsAll === 0
      ? 0
      : Math.round((completedLessonsAll * 1000) / totalLessonsAll) / 10;

  function clampPercent(value: number) {
    return Math.max(0, Math.min(100, value));
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
          <p className="dashboard-card-label">PROGRESS</p>
          <div className="dashboard-card-value">{overallPercentage}%</div>
          <p>
            {completedLessonsAll} of {totalLessonsAll} lessons completed
          </p>
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

      {/* COURSE PROGRESS */}

      <section className="courses-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">PROGRESS</p>
            <h2>Course Progress</h2>
            <p>How much of each course you have completed.</p>
          </div>
        </div>

        {progress.length === 0 ? (
          <div className="dashboard-empty">
            <p>No course progress to show yet.</p>
          </div>
        ) : (
          <div className="progress-list">
            {progress.map((item) => {
              const percent = clampPercent(item.completionPercentage);

              return (
                <div className="progress-item" key={item.courseId}>
                  <div className="progress-head">
                    <strong>{item.courseTitle}</strong>
                    <span className="progress-percent">{percent}%</span>
                  </div>

                  <div
                    className="progress-track"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percent}
                    aria-label={`${item.courseTitle} progress`}
                  >
                    <div
                      className={`progress-fill${percent >= 100 ? " complete" : ""}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <p className="progress-meta">
                    {item.totalLessons === 0
                      ? "No lessons added yet"
                      : `${item.completedLessons} of ${item.totalLessons} lessons completed`}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

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

