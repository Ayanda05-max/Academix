import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ListChecks, Clock, Award, Bell } from "lucide-react";
import "../dashboardPanels.css";
import "./studentHome.css";

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

type Submission = {
  id: number;
  assignmentId: number;
  status: string;
};

type Grade = {
  id: number;
  assignmentTitle: string;
  totalMarks: number;
  marksAwarded: number;
  feedback?: string | null;
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

const TWO_DAYS = 48 * 3600000;

// Text like "Due in 3 days"
function dueText(dueDate: string) {
  const hours = Math.floor(
    (new Date(dueDate).getTime() - Date.now()) / 3600000
  );

  if (hours < 1) {
    return "Due in under an hour";
  }

  if (hours < 48) {
    return `Due in ${hours} ${hours === 1 ? "hour" : "hours"}`;
  }

  return `Due in ${Math.floor(hours / 24)} days`;
}

function isDueSoon(dueDate: string) {
  return new Date(dueDate).getTime() - Date.now() < TWO_DAYS;
}

function percentOf(grade: Grade) {
  if (grade.totalMarks <= 0) {
    return 0;
  }

  return Math.round((grade.marksAwarded / grade.totalMarks) * 100);
}

function formatDay(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StudentDashboard() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [deadlines, setDeadlines] = useState<Assignment[]>([]);
  const [handedIn, setHandedIn] = useState<number[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const token = localStorage.getItem("token");
  const studentId = Number(localStorage.getItem("userId"));

  // A notification is unread when "read" is false
  function isUnread(notification: Notification) {
    return !(notification.read ?? notification.isRead);
  }

  const unreadNotifications = notifications.filter(isUnread);

  // Courses the student is currently enrolled in
  const activeEnrollments = enrollments.filter(
    (enrollment) => enrollment.status === "ACTIVE"
  );

  // Open assignments the student has not handed in yet
  const toHandIn = deadlines.filter(
    (assignment) => !handedIn.includes(assignment.id)
  );

  const dueSoon = toHandIn.filter((assignment) =>
    isDueSoon(assignment.dueDate)
  );

  // Newest grades first
  const recentGrades = [...grades].sort(
    (a, b) => new Date(b.gradedAt).getTime() - new Date(a.gradedAt).getTime()
  );

  const averageGrade =
    grades.length === 0
      ? null
      : Math.round(
          grades.reduce((sum, grade) => sum + percentOf(grade), 0) /
            grades.length
        );

  useEffect(() => {
    loadDashboard();
  }, []);

  // Load everything the dashboard needs
  async function loadDashboard() {
    if (!token) {
      setError("You must be logged in to view your dashboard.");
      setLoaded(true);
      return;
    }

    try {
      const enrolled = await loadEnrollments();

      await Promise.all([
        loadDeadlines(enrolled),
        loadSubmissions(),
        loadGrades(),
        loadNotifications(),
        loadProgress(enrolled),
      ]);
    } catch (error) {
      setError("ERROR: " + String(error));
    } finally {
      setLoaded(true);
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

  // Load the student's own submissions, to know what is already handed in
  async function loadSubmissions() {
    const response = await fetch("/api/submissions/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const data: Submission[] = await response.json();
      setHandedIn(data.map((submission) => submission.assignmentId));
    }
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
          <div className="stat-card-top">
            <p className="dashboard-card-label">MY COURSES</p>
            <span className="stat-icon">
              <BookOpen size={16} />
            </span>
          </div>
          <div className="dashboard-card-value">{activeEnrollments.length}</div>
          <p>Courses you are enrolled in</p>
        </div>

        <div className="dashboard-card">
          <div className="stat-card-top">
            <p className="dashboard-card-label">PROGRESS</p>
            <span className="stat-icon">
              <ListChecks size={16} />
            </span>
          </div>
          <div className="dashboard-card-value">{overallPercentage}%</div>
          <p>
            {completedLessonsAll} of {totalLessonsAll} lessons completed
          </p>
        </div>

        <div
          className={`dashboard-card ${
            dueSoon.length > 0 ? "stat-warning" : ""
          }`}
        >
          <div className="stat-card-top">
            <p className="dashboard-card-label">DEADLINES</p>
            <span className="stat-icon">
              <Clock size={16} />
            </span>
          </div>
          <div className="dashboard-card-value">{toHandIn.length}</div>
          <p>
            {dueSoon.length > 0
              ? `${dueSoon.length} due within 2 days`
              : "Still to hand in"}
          </p>
        </div>

        <div className="dashboard-card">
          <div className="stat-card-top">
            <p className="dashboard-card-label">GRADES</p>
            <span className="stat-icon">
              <Award size={16} />
            </span>
          </div>
          <div className="dashboard-card-value">{grades.length}</div>
          <p>
            {averageGrade === null
              ? "Marks released so far"
              : `Average ${averageGrade}%`}
          </p>
        </div>

        <div className="dashboard-card">
          <div className="stat-card-top">
            <p className="dashboard-card-label">NOTIFICATIONS</p>
            <span className="stat-icon">
              <Bell size={16} />
            </span>
          </div>
          <div className="dashboard-card-value">
            {unreadNotifications.length}
          </div>
          <p>Unread updates</p>
        </div>
      </div>

      {/* DEADLINES AND GRADES */}

      <div className="home-grid">
        <section className="home-panel">
          <div className="home-panel-header">
            <h2>Upcoming deadlines</h2>

            <Link to="/student/assignments" className="home-link">
              Assignments
            </Link>
          </div>

          {!loaded ? (
            <p className="home-empty">Loading...</p>
          ) : toHandIn.length === 0 ? (
            <p className="home-empty">
              Nothing to hand in right now. Anything you have submitted is
              under Assignments.
            </p>
          ) : (
            <ul className="home-list">
              {toHandIn.slice(0, 5).map((assignment) => (
                <li className="home-list-item" key={assignment.id}>
                  <div className="home-list-main">
                    <strong>{assignment.title}</strong>
                    <span>
                      {assignment.courseTitle} &middot; {assignment.totalMarks}{" "}
                      marks &middot; {formatDay(assignment.dueDate)},{" "}
                      {formatTime(assignment.dueDate)}
                    </span>
                  </div>

                  <div className="home-list-side">
                    <span
                      className={`status-badge ${
                        isDueSoon(assignment.dueDate)
                          ? "status-soon"
                          : "status-draft"
                      }`}
                    >
                      {dueText(assignment.dueDate)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {toHandIn.length > 5 && (
            <p className="home-more">and {toHandIn.length - 5} more</p>
          )}
        </section>

        <section className="home-panel">
          <div className="home-panel-header">
            <h2>Recent grades</h2>

            <Link to="/student/grades" className="home-link">
              All grades
            </Link>
          </div>

          {!loaded ? (
            <p className="home-empty">Loading...</p>
          ) : recentGrades.length === 0 ? (
            <p className="home-empty">No grades released yet.</p>
          ) : (
            <ul className="home-list">
              {recentGrades.slice(0, 4).map((grade) => {
                const percent = percentOf(grade);

                return (
                  <li className="home-list-item" key={grade.id}>
                    <div className="home-list-main">
                      <strong>{grade.assignmentTitle}</strong>
                      <span>
                        {grade.marksAwarded} / {grade.totalMarks} &middot;{" "}
                        {formatDay(grade.gradedAt)}
                      </span>

                      {grade.feedback && (
                        <span className="home-feedback">
                          {grade.feedback}
                        </span>
                      )}
                    </div>

                    <div className="home-list-side">
                      <span
                        className={`st-badge ${
                          percent >= 50 ? "good" : "bad"
                        }`}
                      >
                        {percent}%
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* PROGRESS AND NOTIFICATIONS */}

      <div className="home-grid">
        <section className="home-panel">
          <div className="home-panel-header">
            <h2>Course progress</h2>

            <Link to="/student/courses" className="home-link">
              My courses
            </Link>
          </div>

          {!loaded ? (
            <p className="home-empty">Loading...</p>
          ) : progress.length === 0 ? (
            <p className="home-empty">No course progress to show yet.</p>
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
                        className={`progress-fill${
                          percent >= 100 ? " complete" : ""
                        }`}
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

        <section className="home-panel">
          <div className="home-panel-header">
            <h2>New notifications</h2>

            <Link to="/student/notifications" className="home-link">
              All notifications
            </Link>
          </div>

          {!loaded ? (
            <p className="home-empty">Loading...</p>
          ) : unreadNotifications.length === 0 ? (
            <p className="home-empty">You are all caught up.</p>
          ) : (
            <ul className="home-list">
              {unreadNotifications.slice(0, 4).map((notification) => (
                <li className="home-list-item" key={notification.id}>
                  <div className="home-list-main">
                    <strong>{notification.message}</strong>
                    <span>{formatDay(notification.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {unreadNotifications.length > 4 && (
            <p className="home-more">
              and {unreadNotifications.length - 4} more unread
            </p>
          )}
        </section>
      </div>
    </>
  );
}

export default StudentDashboard;
